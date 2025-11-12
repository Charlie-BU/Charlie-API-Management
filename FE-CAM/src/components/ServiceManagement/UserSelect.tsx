import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Message, Select, Spin } from "@cloud-materials/common";
import type { UserProfile } from "@/services/user/types";

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
            label: string;
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
                label: `${user.nickname} (${user.username}) - ${user.email}`,
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
            onSearch={handleSearch}
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
