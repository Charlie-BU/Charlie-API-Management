import { useState } from "react";
import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";
import { Message, Select, Space, Spin } from "@cloud-materials/common";
import type { UserProfile, UserRole } from "@/services/user/types";
import { genUserRoleTag } from "@/utils";

const UserSelect: React.FC<{
    getUserByUsernameOrNicknameOrEmail: (
        value: string
    ) => Promise<UserProfile[]>;
    onSelectId: (id: number) => void;
}> = ({ getUserByUsernameOrNicknameOrEmail, onSelectId }) => {
    const { t } = useTranslation();
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<
        {
            label: React.ReactNode;
            value: number;
        }[]
    >([]);

    const handleSearch = async (value: string) => {
        if (value.length < 2) {
            return;
        }
        try {
            setFetching(true);
            const users = await getUserByUsernameOrNicknameOrEmail(value);
            const opts = users.map((user) => ({
                label: (
                    <Space style={{ whiteSpace: "nowrap" }}>
                        {genUserRoleTag(user.role as UserRole)}
                        <span style={{ cursor: "default" }}>
                            {user.nickname} ({user.username}) - {user.email}
                        </span>
                    </Space>
                ),
                value: user.id,
            }));
            setOptions(opts);
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : t("common.failure");
            Message.error(msg);
        } finally {
            setFetching(false);
        }
    };

    const debouncedSearch = debounce(handleSearch, 300);

    return (
        <Select
            showSearch
            options={options}
            placeholder="Search by username, nickname or email"
            filterOption={false}
            notFoundContent={
                fetching ? (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Spin style={{ margin: 12 }} />
                    </div>
                ) : null
            }
            onSearch={debouncedSearch}
            onChange={(value) => {
                const id = Number(value);
                if (!Number.isNaN(id)) {
                    onSelectId(id);
                } else {
                    Message.warning("选择的用户ID异常");
                }
            }}
        />
    );
};

export default UserSelect;
