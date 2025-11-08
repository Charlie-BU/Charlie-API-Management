import type {
    AllServiceItem,
    Pagination,
    ServiceItem,
    ServiceRange,
} from "@/services/service/types";
import { formatDateOrDateTime } from "@/utils";
import { Avatar, Table, Typography, Tag } from "@cloud-materials/common";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

const ServiceList: React.FC<{
    serviceList: ServiceItem[];
    range: ServiceRange;
    pagination: Pagination;
    loading: boolean;
    handlePageChange: (pageSize: number, currentPage?: number) => void;
}> = (props) => {
    const { serviceList, range, pagination, loading, handlePageChange } = props;

    const { t } = useTranslation();

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
            render: (version: string) => <Tag color="blue">{version}</Tag>,
        },
        {
            title: t("service.owner"),
            key: "owner",
            width: 160,
            dataIndex: "owner_name",
            render: (owner_name?: string | null) => (
                <Avatar size={30} style={{ backgroundColor: "#ecf2ff" }}>
                    {owner_name?.[0] || "-"}
                </Avatar>
            ),
        },
        {
            title: t("common.description"),
            dataIndex: "description",
            key: "description",
        },
        {
            title: t("service.created_at"),
            dataIndex: "created_at",
            key: "created_at",
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
        });
    }
    if (range === "AllServices") {
        columns.push(
            {
                title: t("service.is_deleted"),
                dataIndex: "is_deleted",
                key: "is_deleted",
                width: 120,
                // @ts-ignore
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
                render: (deleted_at: string) => (
                    <Text>{formatDateOrDateTime(deleted_at, "minute")}</Text>
                ),
            }
        );
    }

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
