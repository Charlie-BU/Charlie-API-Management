import type { Pagination, ServiceItem } from "@/services/service/types";
import { Avatar, Table, Typography, Tag } from "@cloud-materials/common";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

const ServiceList: React.FC<{
    serviceList: ServiceItem[];
    pagination: Pagination;
    loading: boolean;
    handlePageChange: (pageSize: number, currentPage?: number) => void;
}> = (props) => {
    const { serviceList, pagination, loading, handlePageChange } = props;

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
            render: (v: string) => <Tag color="blue">{v}</Tag>,
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
    ];

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
