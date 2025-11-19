import { useState } from "react";
import {
    Button,
    Card,
    Space,
    Tag,
    Typography,
    Avatar,
    Spin,
    Divider,
    Table,
    Popover,
    IconCommon,
    Descriptions,
} from "@cloud-materials/common";

import styles from "./index.module.less";
import { formatDateOrDateTime, genApiLevelTag, genApiMethodTag } from "@/utils";
import type { ApiDetail, ApiDraftDetail, ApiLevel } from "@/services/api/types";

const { Title, Text, Paragraph } = Typography;

// Mock Data
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

// 响应参数静态数据
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

const tsRequestExample = `interface LoginRequest {\n  username: string;\n  password: string;\n}`;
const tsResponseExample = `interface LoginResponse {\n  status: number;\n  message: string;\n  access_token: string;\n}`;

const Detail: React.FC<{
    loading: boolean;
    apiDetail: ApiDetail | ApiDraftDetail;
}> = (props) => {
    const { loading, apiDetail } = props;

    // Mock Data
    const [expandedReq, setExpandedReq] = useState(true);
    const [expandedRes, setExpandedRes] = useState(false);

    if (loading || !apiDetail || Object.keys(apiDetail).length === 0) {
        return (
            <div className={styles.loadingCenter}>
                <Spin dot />
            </div>
        );
    }

    const apiBriefInfo = [
        {
            label: "接口名称",
            value: apiDetail.name,
        },
        {
            label: "接口 Owner",
            value: (
                <Popover
                    content={`${apiDetail.owner?.nickname} (${apiDetail.owner?.username}) - ${apiDetail.owner?.email}`}
                >
                    <Avatar size={25} style={{ backgroundColor: "#ecf2ff" }}>
                        {apiDetail.owner?.nickname?.[0] ||
                            apiDetail.owner?.username?.[0] ||
                            "-"}
                    </Avatar>
                </Popover>
            ),
        },
        {
            label: "接口等级",
            value: genApiLevelTag(apiDetail.level as ApiLevel, "small"),
        },
        {
            label: "创建时间",
            value: apiDetail.created_at
                ? formatDateOrDateTime(apiDetail.created_at)
                : "-",
        },
        {
            label: "更新时间",
            value: apiDetail.updated_at
                ? formatDateOrDateTime(apiDetail.updated_at)
                : "-",
        },
        {
            label: "接口描述",
            value: apiDetail.description || "-",
        },
    ];

    return (
        <div className={styles.content}>
            <div className={styles.header}>
                <Title heading={5} className={styles.pathTitle}>
                    <Space size={10}>
                        {genApiMethodTag(apiDetail?.method, "medium")}
                        {apiDetail.path}
                    </Space>
                </Title>
                <Space>
                    <Button type="secondary">编辑</Button>
                    <Button type="secondary">Mock</Button>
                    <Button type="primary">测试</Button>
                </Space>
            </div>

            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
                <IconCommon /> 接口信息
            </div>
            <Descriptions
                data={apiBriefInfo}
                layout="inline-vertical"
                style={{ marginBottom: -10 }}
            />

            <Divider />
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
                <IconCommon /> 请求参数
            </div>

            <div className={styles.subHeader}>
                <Text>Body 参数</Text>
                <Space>
                    <Button
                        type="text"
                        onClick={() => setExpandedReq((v) => !v)}
                    >
                        {expandedReq ? "收起示例" : "展开示例"}
                    </Button>
                    <Tag color="arcoblue">TypeScript</Tag>
                </Space>
            </div>
            <Table
                pagination={false}
                columns={requestColumns as any}
                rowKey="name"
                data={requestData}
                size="small"
            />
            {expandedReq && (
                <Card className={styles.codeCard} bordered={false}>
                    <pre className={styles.codeBlock}>{tsRequestExample}</pre>
                </Card>
            )}

            <Divider />
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
                <IconCommon /> 响应参数
            </div>
            <Table
                pagination={false}
                columns={responseColumns as any}
                rowKey="name"
                data={responseData}
                size="small"
            />
            {expandedRes && (
                <Card className={styles.codeCard} bordered={false}>
                    <pre className={styles.codeBlock}>{tsResponseExample}</pre>
                </Card>
            )}
        </div>
    );
};

export default Detail;
