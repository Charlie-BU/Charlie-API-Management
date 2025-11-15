import { Modal, Tag } from "@cloud-materials/common";
import { t } from "i18next";
import type { ApiMethod } from "./services/service/types";

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

export const genApiMethodTag = (method: ApiMethod) => {
    switch (method) {
        case "GET":
            return <Tag color="blue">{method}</Tag>;
        case "POST":
            return <Tag color="green">{method}</Tag>;
        case "PUT":
            return <Tag color="orangered">{method}</Tag>;
        case "DELETE":
            return <Tag color="red">{method}</Tag>;
        case "PATCH":
            return <Tag color="orange">{method}</Tag>;
        default:
            return null;
    }
};
