import {
    Avatar,
    Typography,
    Space,
    Divider,
    Layout,
    IconLock,
    IconPoweroff,
    Popover,
} from "@cloud-materials/common";
import styles from "./index.module.less";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import type { UserProfile, UserRole } from "@/services/user/types";
import { genUserRoleTag } from "@/utils";
interface UserProfileProps {
    userInfo: UserProfile;
    logout: () => void;
    openModifyPasswordModal: () => void;
}

const Profile: React.FC<UserProfileProps> = ({
    userInfo,
    logout,
    openModifyPasswordModal,
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleModifyPassword = () => {
        openModifyPasswordModal();
    };

    return (
        <div style={{ width: 250 }}>
            <div style={{ padding: "12px 12px" }}>
                <Layout>
                    <Layout.Sider
                        width={40}
                        style={{
                            boxShadow: "none",
                        }}
                    >
                        <div>
                            <Avatar
                                size={40}
                                style={{ backgroundColor: "#ecf2ff" }}
                            >
                                {userInfo.nickname[0] || userInfo.username[0]}
                            </Avatar>
                        </div>
                    </Layout.Sider>
                    <Layout.Content style={{ width: "100%", paddingLeft: 12 }}>
                        <Popover content={userInfo.username}>
                            <Typography.Text style={{ fontSize: 16 }}>
                                {userInfo.nickname || userInfo.username}
                            </Typography.Text>
                        </Popover>
                        <Typography.Ellipsis
                            rows={1}
                            showTooltip
                            style={{ fontSize: 14, color: "#808080" }}
                        >
                            {userInfo.email}
                        </Typography.Ellipsis>
                    </Layout.Content>
                </Layout>
                <Space style={{ marginTop: 8, marginLeft: 50 }}>
                    {genUserRoleTag(userInfo.role as UserRole, "small")}
                </Space>
            </div>
            <Divider style={{ margin: 0 }} />
            <div className={styles.menuList}>
                <div className={styles.menuItem} onClick={handleModifyPassword}>
                    <IconLock className={styles.menuIcon} />{" "}
                    {t("common.modifyPassword")}
                </div>
                <div
                    className={styles.menuItem}
                    onClick={() => {
                        logout();
                        navigate("/");
                    }}
                >
                    <IconPoweroff className={styles.menuIcon} />{" "}
                    {t("common.logout")}
                </div>
            </div>
        </div>
    );
};

export default Profile;
