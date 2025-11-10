import { Space, Avatar, Button, Typography } from "@cloud-materials/common";
import { useTranslation } from "react-i18next";

import styles from "./index.module.less";
import { useUser } from "@/hooks/useUser";
import type { UserProfile } from "@/services/user/types";

const { Title, Text } = Typography;

// 已登录欢迎区块
const WelcomeLoggedIn: React.FC<{
    user: UserProfile;
    loading?: boolean;
}> = ({ user }) => {
    const { t } = useTranslation();
    const displayName = user.nickname || user.username;
    return (
        <div className={styles.hero}>
            <Space size={12} align="center">
                <Avatar size={40} style={{ backgroundColor: "#ecf2ff" }}>
                    {displayName[0]}
                </Avatar>
                <div>
                    <Title heading={4} className={styles.title}>
                        {t("service.welcomeTitle")}
                    </Title>
                    <Text className={styles.subtitle}>
                        {t("service.welcomeBack")}
                        {displayName}（{t(`user.${user.role}`)} · L{user.level}
                        ）
                    </Text>
                </div>
            </Space>
            <div className={styles.actions}>
                <Space>
                    <Button type="primary">{t("common.create")}</Button>
                </Space>
            </div>
        </div>
    );
};

// 未登录欢迎区块
const WelcomeGuest: React.FC = () => {
    const { t } = useTranslation();
    const { openLoginModal, openRegisterModal } = useUser();

    const handleGoRegister = () => {
        openRegisterModal();
    };
    const handleGoLogin = () => {
        openLoginModal();
    };
    return (
        <div className={styles.hero}>
            <Title heading={3} className={styles.title}>
                {t("service.welcomeTitle")}
            </Title>
            <Text className={styles.subtitle}>
                登录后即可管理你的 API
                服务与版本，点击右上角头像进行登录或直接注册。
            </Text>
            <div className={styles.actions}>
                <Space>
                    <Button type="primary" onClick={handleGoLogin}>
                        {t("login.login")}
                    </Button>
                    <Button type="primary" onClick={handleGoRegister}>
                        {t("register.submit")}
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export { WelcomeLoggedIn, WelcomeGuest };
