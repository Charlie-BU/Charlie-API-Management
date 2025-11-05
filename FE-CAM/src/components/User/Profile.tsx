import {
    Avatar,
    Typography,
    Space,
    Tag,
    Divider,
    Layout,
    IconLock,
    IconPoweroff,
} from "@cloud-materials/common";
import styles from "./index.module.less";
import { useTranslation } from "react-i18next";

import type { UserProfile } from "@/services/user/types";

interface UserProfileProps {
    userInfo: UserProfile;
    logout: () => void;
}

const Profile: React.FC<UserProfileProps> = ({ userInfo, logout }) => {
    const { t } = useTranslation();

    const handleChangePassword = () => {
        // TODO: 跳转到修改密码页面或弹出修改密码对话框
        console.log("修改密码功能开发中（示例）");
    };

    return (
        <div style={{ width: 250 }}>
            <div style={{ padding: "16px 12px" }}>
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
                                {userInfo.username[0]}
                            </Avatar>
                        </div>
                    </Layout.Sider>
                    <Layout.Content style={{ width: "100%", paddingLeft: 12 }}>
                        <Typography.Text style={{ fontSize: 16 }}>
                            {userInfo.username}
                        </Typography.Text>
                        <Typography.Ellipsis
                            rows={1}
                            showTooltip
                            style={{ fontSize: 14, color: "#808080" }}
                        >
                            {userInfo.email}
                        </Typography.Ellipsis>
                    </Layout.Content>
                </Layout>
                <Space style={{ marginTop: 12, marginLeft: 50 }}>
                    <Tag size="small" color="blue">
                        {t(`user.${userInfo.role}`)}
                    </Tag>
                    <Tag size="small" color="green">
                        L{userInfo.level}
                    </Tag>
                </Space>
            </div>
            <Divider style={{ margin: 0 }} />
            <div className={styles.menuList}>
                <div className={styles.menuItem} onClick={handleChangePassword}>
                    <IconLock className={styles.menuIcon} />{" "}
                    {t("common.changePassword")}
                </div>
                <div className={styles.menuItem} onClick={logout}>
                    <IconPoweroff className={styles.menuIcon} />{" "}
                    {t("common.logout")}
                </div>
            </div>
        </div>
    );
};

export default Profile;
