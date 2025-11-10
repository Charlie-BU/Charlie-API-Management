import type {
    Pagination,
    ServiceItem,
    ServiceRange,
} from "@/services/service/types";
import { formatDateOrDateTime } from "@/utils";
import {
    Avatar,
    Table,
    Typography,
    Tag,
    Button,
    Popover,
    type TableColumnProps,
} from "@cloud-materials/common";

import styles from "./index.module.less";
import { useTranslation } from "react-i18next";
import type { UserProfile } from "@/services/user/types";

const { Text } = Typography;

const ServiceList: React.FC<{
    serviceList: ServiceItem[];
    range: ServiceRange;
    pagination: Pagination;
    loading: boolean;
    user: UserProfile | null;
    handlePageChange: (pageSize: number, currentPage?: number) => void;
}> = (props) => {
    const { serviceList, range, pagination, loading, user, handlePageChange } =
        props;

    const { t } = useTranslation();

    const columns: TableColumnProps<ServiceItem>[] = [
        {
            title: t("service.serviceUUID"),
            dataIndex: "service_uuid",
            key: "service_uuid",
            width: 240,
            align: "center" as const,
            render: (uuid: string) => (
                <Button
                    type="text"
                    size="small"
                    className={styles["hover-underline"]}
                >
                    {uuid}
                </Button>
            ),
        },
        {
            title: t("service.latestVersion"),
            dataIndex: "version",
            key: "version",
            width: 140,
            align: "center" as const,
            render: (version: string) => <Tag color="blue">{version}</Tag>,
        },
        {
            title: t("service.owner"),
            key: "owner_name",
            width: 160,
            dataIndex: "owner_name",
            align: "center" as const,
            render: (_: any, item: ServiceItem) => {
                let owner: UserProfile | null = null;
                if (item.owner_id === user?.id) {
                    owner = user;
                } else if (item.owner_id !== user?.id && item.owner) {
                    owner = item.owner;
                }
                return (
                    <Popover
                        content={`${owner?.nickname} (${owner?.username}) - ${owner?.email}`}
                    >
                        <Avatar
                            size={30}
                            style={{ backgroundColor: "#ecf2ff" }}
                        >
                            {owner?.nickname?.[0] ||
                                owner?.username?.[0] ||
                                "-"}
                        </Avatar>
                    </Popover>
                );
            },
        },
        {
            title: t("common.description"),
            dataIndex: "description",
            key: "description",
            align: "center" as const,
        },
        {
            title: t("service.created_at"),
            dataIndex: "created_at",
            key: "created_at",
            align: "center" as const,
            render: (created_at: string) => (
                <Text>{formatDateOrDateTime(created_at, "minute")}</Text>
            ),
        },
    ];

    if (range === "MyDeletedServices") {
        columns.push({
            title: t("service.deleted_at"),
            dataIndex: "deleted_at",
            key: "deleted_at",
            align: "center" as const,
        });
    }
    if (range === "AllServices") {
        columns.push(
            {
                title: t("service.is_deleted"),
                dataIndex: "is_deleted",
                key: "is_deleted",
                width: 120,
                align: "center" as const,
                render: (col: boolean) => {
                    return (
                        <Tag color={col ? "red" : "green"}>
                            {col ? t("common.yes") : t("common.no")}
                        </Tag>
                    );
                },
            },
            {
                title: t("service.deleted_at"),
                dataIndex: "deleted_at",
                key: "deleted_at",
                align: "center" as const,
                render: (deleted_at: string) => (
                    <Text>{formatDateOrDateTime(deleted_at, "minute")}</Text>
                ),
            }
        );
    }
    columns.push({
        title: "操作",
        key: "actions",
        width: 100,
        fixed: "right" as const,
        align: "center" as const,

        render: (_: any, item: ServiceItem) => (
            <div className={styles["custom-action-btn"]} style={{ display: "flex" }}>
                <Button type="text" size="small">
                    查看
                </Button>
                {(!item.is_deleted ? (
                    <Button
                        type="text"
                        status="danger"
                        size="small"
                    >
                        删除
                    </Button>
                ) : (
                    <Button
                        type="text"
                        status="success"
                        size="small"
                    >
                        恢复
                    </Button>
                ))}
            </div>
        ),
    });

    return (
        <Table
            loading={loading}
            rowKey="id"
            columns={columns}
            data={serviceList}
            pagination={{
                pageSize: pagination.page_size,
                total: pagination.total,
                showTotal: true,
                current: pagination.current_page,
                onChange: (pageNumber: number, pageSize: number) => {
                    handlePageChange(pageSize, pageNumber);
                },
            }}
        />
    );
};

export default ServiceList;
