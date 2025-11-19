import type { ApiDetail, ApiDraftDetail } from "@/services/api/types";
import {
    IconCommon,
    Space,
    Table,
    Tag,
    Typography,
} from "@cloud-materials/common";

const { Text } = Typography;

const responseColumns = [
    { title: "字段名称", dataIndex: "name", width: 160 },
    { title: "参数类型", dataIndex: "type", width: 120 },
    { title: "类型格式", dataIndex: "format", width: 120 },
    { title: "备注", dataIndex: "desc" },
];

const responseData = [
    { name: "message", type: "string", format: "string", desc: "" },
    { name: "access_token", type: "string", format: "string", desc: "" },
];

const ResponseParams = (props: { apiDetail: ApiDetail | ApiDraftDetail }) => {
    const { apiDetail } = props;

    return (
        <Space direction="vertical" size={12}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 响应参数
            </div>
            <Space direction="vertical" size={8}>
                <Text>状态码：200</Text>
                <Table
                    pagination={false}
                    columns={responseColumns as any}
                    rowKey="name"
                    data={responseData}
                    size="small"
                />
            </Space>
        </Space>
    );
};

export default ResponseParams;
