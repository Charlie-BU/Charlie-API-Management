import type { ApiDetail, ApiDraftDetail } from "@/services/api/types";
import {
    IconCommon,
    Space,
    Table,
    Tag,
    Typography,
} from "@cloud-materials/common";

const { Text } = Typography;

const requestColumns = [
    { title: "字段名称", dataIndex: "name", width: 160 },
    { title: "参数类型", dataIndex: "type", width: 120 },
    { title: "类型格式", dataIndex: "format", width: 120 },
    {
        title: "是否必填",
        dataIndex: "required",
        width: 120,
        render: (v: boolean) => (
            <Tag color={v ? "red" : "gray"}>{v ? "必填" : "可选"}</Tag>
        ),
    },
    { title: "备注", dataIndex: "desc" },
    { title: "示例值", dataIndex: "example", width: 200 },
];

const requestData = [
    {
        name: "username",
        type: "string",
        format: "string",
        required: true,
        desc: "",
        example: "cam_user",
    },
    {
        name: "password",
        type: "string",
        format: "string",
        required: true,
        desc: "",
        example: "******",
    },
];

const RequestParams = (props: { apiDetail: ApiDetail | ApiDraftDetail }) => {
    const { apiDetail } = props;

    return (
        <Space direction="vertical" size={12}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 请求参数
            </div>
            <Space direction="vertical" size={8}>
                <Text>Body 参数</Text>
                <Table
                    pagination={false}
                    columns={requestColumns as any}
                    rowKey="name"
                    data={requestData}
                    size="small"
                />
            </Space>
        </Space>
    );
};

export default RequestParams;
