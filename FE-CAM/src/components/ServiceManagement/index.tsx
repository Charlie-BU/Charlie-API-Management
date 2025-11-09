import React, { useEffect, useState } from "react";
import {
    Typography,
    Button,
    Divider,
    Avatar,
    Space,
    Tabs,
    Message,
    CModal,
    Select,
    Spin,
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
const LoggedInView: React.FC<{
    user: UserProfile;
    getUserByUsernameOrNicknameOrEmail: (
        username_or_nickname_or_email: string
    ) => Promise<UserProfile[]>;
}> = ({ user, getUserByUsernameOrNicknameOrEmail }) => {
    const { t } = useTranslation();
    const [serviceRange, setServiceRange] =
        useState<ServiceRange>("MyServices");
    const {
        serviceList,
        loading,
        fetchMyNewestServices,
        fetchMyDeletedServices,
        fetchHisNewestServicesByOwnerId,
        fetchAllServices,
    } = useService();
    const [pagination, setPagination] = useState({
        page_size: 10,
        current_page: 1,
        total: 0,
    });

    const handlePageChange = (pageSize: number, currentPage?: number) => {
        setPagination((prev) => ({
            ...prev,
            page_size: pageSize,
            current_page: currentPage || prev.current_page,
        }));
    };

    // const [hisId, setHisId] = useState<number>(-1);
    let hisId: number = -1;

    useEffect(() => {
        switch (serviceRange) {
            case "MyServices":
                // 方法是异步的，返回 Promise，但在 useEffect 中不能直接 await，
                // 所以需要使用 then 方法处理 Promise .resolve 后的结果
                fetchMyNewestServices(pagination)
                    .then((total) => {
                        setPagination((prev) => ({
                            ...prev,
                            total,
                        }));
                    })
                    .catch((err) => {
                        Message.warning(err.message || "获取服务失败");
                    });
                break;
            case "MyDeletedServices":
                fetchMyDeletedServices(pagination)
                    .then((total) => {
                        setPagination((prev) => ({
                            ...prev,
                            total,
                        }));
                    })
                    .catch((err) => {
                        Message.warning(err.message || "获取服务失败");
                    });
                break;
            case "HisServices":
                fetchHisNewestServicesByOwnerId(hisId, pagination)
                    .then((total) => {
                        setPagination((prev) => ({
                            ...prev,
                            total,
                        }));
                    })
                    .catch((err) => {
                        Message.warning(err.message || "获取服务失败");
                    });
                break;
            case "AllServices":
                fetchAllServices(pagination)
                    .then((total) => {
                        setPagination((prev) => ({
                            ...prev,
                            total,
                        }));
                    })
                    .catch((err) => {
                        Message.warning(err.message || "获取服务失败");
                    });
                break;
        }
    }, [serviceRange, hisId, pagination.page_size, pagination.current_page]);

    // 查看他人service搜索组件
    const HisUserSelect: React.FC<{
        onSelectId: (id: number) => void;
    }> = ({ onSelectId }) => {
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
                    label: `${user.nickname} (${user.username}) (${user.email})`,
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
                    if (typeof value === "number") {
                        onSelectId(value);
                    }
                }}
            />
        );
    };

    const handleTabChange = (key: ServiceRange) => {
        if (key === "HisServices") {
            const modal = CModal.openArcoForm({
                title: "查看他人服务",
                content: (
                    <>
                        <HisUserSelect onSelectId={(id) => hisId = id} />
                    </>
                ),
                cancelText: t("common.cancel"),
                okText: t("common.confirm"),
                onOk: async () => {
                    try {
                        if (hisId <= 0) {
                            throw new Error("未选择用户");
                        }
                        setServiceRange("HisServices");
                        setPagination({
                            ...pagination,
                            current_page: 1,
                        });
                        // 显式关闭弹窗，避免依赖隐式行为
                        modal.close();
                    } catch (err: unknown) {
                        const msg =
                            err instanceof Error
                                ? err.message
                                : t("common.failure");
                        Message.warning(msg);
                        // 抛出错误以阻止弹窗自动关闭（库内有相关处理）
                        throw err;
                    }
                },
                onCancel: () => {
                    // setHisId(-1);
                    hisId = -1
                    modal.close();
                    setServiceRange(key);
                    setPagination({
                        ...pagination,
                        current_page: 1,
                    });
                },
            });
        } else {
            setServiceRange(key);
            setPagination({
                ...pagination,
                current_page: 1,
            });
        }
    };

    return (
        <div className={styles.home}>
            <WelcomeLoggedIn user={user} />
            <Divider />
            <Title heading={5} style={{ marginBottom: 12 }}>
                {t("service.list")}
            </Title>

            <Tabs
                activeTab={serviceRange}
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
                range={serviceRange}
                pagination={pagination}
                handlePageChange={handlePageChange}
                loading={loading}
            />
        </div>
    );
};

const ServiceManagement: React.FC = () => {
    const { user, getUserByUsernameOrNicknameOrEmail } = useUser();
    if (!user) {
        return (
            <div className={styles.home}>
                <WelcomeGuest />
            </div>
        );
    }
    return (
        <LoggedInView
            user={user}
            getUserByUsernameOrNicknameOrEmail={
                getUserByUsernameOrNicknameOrEmail
            }
        />
    );
};

export default ServiceManagement;
