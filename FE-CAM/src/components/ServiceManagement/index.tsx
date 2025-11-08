import React, { useEffect, useState } from "react";
import {
    Typography,
    Button,
    Divider,
    Avatar,
    Space,
    Tabs,
    Popconfirm,
    Message,
} from "@cloud-materials/common";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";
import { useUser } from "@/hooks/useUser";
import { useService } from "@/hooks/useService";
import type { UserProfile } from "@/services/user/types";
import ServiceList from "./ServiceList";
import type { ServiceRange } from "@/services/service/types";

const { Title, Text } = Typography;
// const { Search } = Input;

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

// 已登录视图（包含列表）
const LoggedInView: React.FC<{ user: UserProfile }> = ({ user }) => {
    const { t } = useTranslation();
    const [serviceRange, setServiceRange] =
        useState<ServiceRange>("MyServices");
    const {
        serviceList,
        pagination,
        loading,
        fetchMyNewestServices,
        fetchMyDeletedServices,
        fetchHisNewestServicesByOwnerId,
        fetchAllServices,
    } = useService(serviceRange);

    const [hisId, setHisId] = useState<number>(-1);

    useEffect(() => {
        switch (serviceRange) {
            case "MyServices":
                fetchMyNewestServices();
                break;
            case "MyDeletedServices":
                fetchMyDeletedServices().catch((err) => {
                    Message.warning(err.message || "获取服务失败");
                });
                break;
            case "HisServices":
                fetchHisNewestServicesByOwnerId(hisId).catch((err) => {
                    Message.warning(err.message || "获取服务失败");
                });
                break;
            case "AllServices":
                fetchAllServices().catch((err) => {
                    Message.warning(err.message || "获取服务失败");
                });
                break;
        }
    }, [serviceRange, hisId]);

    const handleTabChange = (key: ServiceRange) => {
        if (key === "HisServices") {
            // todo
            console.log("HisServices");
        }
        setServiceRange(key);
    };

    return (
        <div className={styles.home}>
            <WelcomeLoggedIn user={user} />
            <Divider />
            <Title heading={5} style={{ marginBottom: 12 }}>
                {t("service.list")}
            </Title>

            <Tabs
                defaultActiveTab={serviceRange}
                onChange={(key) => handleTabChange(key as ServiceRange)}
                style={{ marginBottom: 18 }}
            >
                <Tabs.TabPane key="MyServices" title={"My Services"} />
                <Tabs.TabPane
                    key="MyDeletedServices"
                    title="My Deleted Services"
                />
                {user.level === 0 && (
                    <Tabs.TabPane key="HisServices" title="His Services" />
                )}
                {user.level === 0 && (
                    <Tabs.TabPane key="AllServices" title="All Services" />
                )}
            </Tabs>
            <ServiceList
                serviceList={serviceList}
                pagination={pagination}
                loading={loading}
            />
        </div>
    );
};

const ServiceManagement: React.FC = () => {
    const { user } = useUser();
    if (!user) {
        return (
            <div className={styles.home}>
                <WelcomeGuest />
            </div>
        );
    }
    return <LoggedInView user={user} />;
};

export default ServiceManagement;
