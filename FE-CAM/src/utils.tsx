import { Avatar, Modal, Popover, Tag } from "@cloud-materials/common";
import { t } from "i18next";
import type { ApiLevel, HttpMethod } from "./services/api/types";
import type { UserProfile } from "./services/user/types";

const pad = (n: number, length = 2) => String(n).padStart(length, "0");

const parseToDate = (input: string | number | Date): Date | null => {
    if (input == null) return null;
    if (input instanceof Date) {
        return isNaN(input.getTime()) ? null : input;
    }
    if (typeof input === "number") {
        const ms = input < 1e12 ? input * 1000 : input;
        const d = new Date(ms);
        return isNaN(d.getTime()) ? null : d;
    }
    let s = String(input).trim();
    if (!s) return null;
    if (/^\d+$/.test(s)) {
        const ns = Number(s);
        const ms = s.length <= 10 ? ns * 1000 : ns;
        const d = new Date(ms);
        return isNaN(d.getTime()) ? null : d;
    }
    s = s.replace(/\//g, "-");
    if (/Z$|[+-]\d{2}:?\d{2}$/.test(s) || s.includes("T")) {
        const isoLike = s.includes(" ") ? s.replace(" ", "T") : s;
        const d = new Date(isoLike);
        if (!isNaN(d.getTime())) return d;
    }
    const m = s.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
    );
    if (m) {
        const [, y, mo, da, h = "0", mi = "0", se = "0"] = m;
        const d = new Date(
            Number(y),
            Number(mo) - 1,
            Number(da),
            Number(h),
            Number(mi),
            Number(se)
        );
        return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
};

export const formatDateOrDateTime = (
    dateOrDateTime: string | number | Date,
    granularity: "date" | "minute" | "second" = "second"
) => {
    const date = parseToDate(dateOrDateTime);
    if (!date) return "";
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    if (granularity === "date") return `${year}-${month}-${day}`;
    if (granularity === "minute")
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const handleConfirm = (
    onOk: () => void | Promise<void>,
    action?: string,
    confirmText?: string
) => {
    const modal = Modal.confirm({
        title: `确认${action || "操作"}`,
        content: confirmText || `是否确认${action || "执行此操作"}？`,
        cancelText: t("common.cancel"),
        okText: t("common.confirm"),
        okButtonProps: {
            status:
                action?.includes("删除") ||
                action?.toLowerCase().includes("delete")
                    ? "danger"
                    : "default",
        },
        onOk: async () => {
            try {
                await onOk();
            } catch (error: any) {
                modal.close();
            }
        },
        closable: true,
    });
};

export const userAvatar = (users: UserProfile[], size: number, maxCount: number = 5) => {
    if (!users) return null;
    return (
        <Avatar.Group size={size} maxCount={maxCount}>
            {users.map((user) => (
                <Popover
                    key={user.id}
                    content={
                        <span style={{ cursor: "default" }}>
                            {user.nickname} ({user.username}) - {user.email}
                        </span>
                    }
                >
                    <Avatar size={size} style={{ backgroundColor: "#ecf2ff" }}>
                        <span style={{ cursor: "default" }}>
                            {user.nickname?.[0] || user.username?.[0] || "-"}
                        </span>
                    </Avatar>
                </Popover>
            ))}
        </Avatar.Group>
    );
};

export const genApiMethodTag = (
    method: HttpMethod,
    size: "small" | "default" | "medium" | "large" = "default"
) => {
    const methodColorMap = {
        GET: "arcoblue",
        POST: "green",
        PUT: "orangered",
        DELETE: "red",
        PATCH: "orange",
    };

    const color = methodColorMap[method];
    return (
        <Tag color={color} size={size}>
            {method}
        </Tag>
    );
};

export const genApiLevelTag = (
    level: ApiLevel,
    size: "small" | "default" | "medium" | "large" = "default"
) => {
    const levelColorMap = {
        P0: "red",
        P1: "orangered",
        P2: "orange",
        P3: "arcoblue",
        P4: "green",
    };

    const color = levelColorMap[level];
    return (
        <Tag color={color} size={size}>
            {level}
        </Tag>
    );
};

export const genStatusCodeTag = (
    code: number,
    size: "small" | "default" | "medium" | "large" = "default"
) => {
    const codeColorMap: Record<string, string> = {
        "2": "green",
        "4": "orangered",
        "5": "red",
    };
    const color = codeColorMap[code.toString()[0]] || "arcoblue";
    return (
        <Tag color={color} size={size}>
            {code}
        </Tag>
    );
};

export const inIterationWarning = (
    action: Function,
    inIteration: boolean,
    type: "warning" | "reject"
) => {
    if (!inIteration) return action();
    if (type === "warning") {
        const modal = Modal.warning({
            title: "注意",
            content: "当前在迭代中，请确保已保存当前改动",
            okText: "继续",
            onOk: async () => {
                try {
                    action();
                } catch (error: any) {
                    modal.close();
                }
            },
        });
        return;
    } else if (type === "reject") {
        Modal.warning({
            title: "注意",
            content: "当前在迭代中，请先退出当前迭代",
            okText: "返回",
        });
        return;
    }
};
