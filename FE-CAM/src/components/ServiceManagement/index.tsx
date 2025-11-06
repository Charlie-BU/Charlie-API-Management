import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    Input,
    Typography,
    Button,
    Divider,
    Message,
    Tag,
    Avatar,
} from "@cloud-materials/common";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";
import { useUser } from "@/hooks/useUser";
import { GetMyNewestServices } from "@/services/service";
import type { ServiceItem } from "@/services/service/types";

const { Title, Text } = Typography;
const { Search } = Input;

const ServiceManagement: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<ServiceItem[]>([]);
    const [query, setQuery] = useState("");

    const ownerName = user?.nickname || user?.username || "-";

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await GetMyNewestServices();
            setList(res.services || []);
        } catch (err: any) {
            // 未登录或鉴权失败时提示
            Message.warning(t("common.loginFirst"));
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 未登录时不触发请求，避免控制台网络报错
        const token = localStorage.getItem("cam_access_token");
        if (token) {
            fetchData();
        } else {
            setList([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return list;
        return list.filter((s) => s.service_uuid.toLowerCase().includes(q));
    }, [list, query]);

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
            <div className={styles.hero}>
                <Title heading={3} className={styles.title}>
                    {t("service.welcomeTitle")}
                </Title>
                <div className={styles.actions}>
                    <Search
                        allowClear
                        placeholder={t("service.searchPlaceholder")}
                        value={query}
                        onChange={setQuery}
                        style={{ width: 360 }}
                    />
                    <Button
                        type="secondary"
                        onClick={fetchData}
                        loading={loading}
                    >
                        {t("service.refresh")}
                    </Button>
                </div>
            </div>

            <Divider />

            <Title heading={5} style={{ marginBottom: 12 }}>
                {t("service.list")}
            </Title>
            <Table
                loading={loading}
                rowKey="id"
                columns={columns}
                data={filtered}
                pagination={{
                    pageSize: 10,
                    total: filtered.length,
                    showTotal: true,
                }}
            />
        </div>
    );
};

export default ServiceManagement;
