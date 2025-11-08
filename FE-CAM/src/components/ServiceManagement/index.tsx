import React from "react";
import {
    Table,
    Input,
    Typography,
    Button,
    Divider,
    Message,
    Tag,
    Avatar,
    Space,
} from "@cloud-materials/common";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";
import { useUser } from "@/hooks/useUser";
import { useService } from "@/hooks/useService";
import type { UserProfile } from "@/services/user/types";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
// const { Search } = Input;

// 已登录欢迎区块
const WelcomeLoggedIn: React.FC<{
    user: UserProfile;
    onRefresh: () => void;
    loading?: boolean;
}> = ({ user, onRefresh, loading }) => {
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
                        欢迎回来，{displayName}（{t(`user.${user.role}`)} · L
                        {user.level}）
                    </Text>
                </div>
            </Space>
            <div className={styles.actions}>
                <Space>
                    <Button type="primary">{t("common.create")}</Button>
                    <Button
                        type="secondary"
                        onClick={onRefresh}
                        loading={loading}
                    >
                        {t("common.refresh")}
                    </Button>
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
    const { serviceList, pagination, loading, fetchMyNewestServices } =
        useService();
    const ownerName = user?.nickname || user?.username || "-";

    const columns = [
        {
            title: t("service.serviceUUID"),
            dataIndex: "service_uuid",
            key: "service_uuid",
            width: 240,
            render: (uuid: string) => <Text code>{uuid}</Text>,
        },
        {
            title: t("service.latestVersion"),
            dataIndex: "version",
            key: "version",
            width: 140,
            render: (v: string) => <Tag color="blue">{v}</Tag>,
        },
        {
            title: t("service.owner"),
            key: "owner",
            width: 160,
            render: () => (
                <Avatar size={30} style={{ backgroundColor: "#ecf2ff" }}>
                    {ownerName[0]}
                </Avatar>
            ),
        },
        {
            title: t("common.description"),
            dataIndex: "description",
            key: "description",
        },
    ];

    return (
        <div className={styles.home}>
            <WelcomeLoggedIn
                user={user}
                onRefresh={fetchMyNewestServices}
                loading={loading}
            />
            <Divider />
            <Title heading={5} style={{ marginBottom: 12 }}>
                {t("service.list")}
            </Title>
            <Table
                loading={loading}
                rowKey="id"
                columns={columns}
                data={serviceList}
                pagination={{
                    pageSize: pagination.page_size,
                    total: pagination.total,
                    showTotal: true,
                }}
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
