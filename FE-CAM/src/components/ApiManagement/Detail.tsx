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
} from "@cloud-materials/common";

import styles from "./index.module.less";
import { genApiMethodTag } from "@/utils";
import type { ApiDetail, ApiDraftDetail } from "@/services/api/types";

const { Title, Text } = Typography;

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
    console.log(apiDetail)

    return (
        <div className={styles.content}>
            <div className={styles.header}>
                <Title heading={5} className={styles.pathTitle}>
                    <Space>
                        {genApiMethodTag(apiDetail?.method)}
                        {apiDetail?.path}
                    </Space>
                </Title>
                <Space>
                    <Button type="secondary">编辑</Button>
                    <Button type="secondary">Mock</Button>
                    <Button type="primary">测试</Button>
                </Space>
            </div>

            <Card className={styles.section} title={"接口信息"} bordered>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <Text className={styles.infoLabel}>接口名称中文</Text>
                        <Text>login</Text>
                    </div>
                    <div className={styles.infoItem}>
                        <Text className={styles.infoLabel}>接口 owner</Text>
                        <Space>
                            <Avatar
                                size={24}
                                style={{ backgroundColor: "#e8f3ff" }}
                            >
                                卡
                            </Avatar>
                            <Avatar
                                size={24}
                                style={{ backgroundColor: "#e8f3ff" }}
                            >
                                乙
                            </Avatar>
                        </Space>
                    </div>
                    <div className={styles.infoItem}>
                        <Text className={styles.infoLabel}>接口等级</Text>
                        <Tag color="red">P0</Tag>
                    </div>
                    <div className={styles.infoItem}>
                        <Text className={styles.infoLabel}>接口标签</Text>
                        <Text>无</Text>
                    </div>
                    <div
                        className={styles.infoItem}
                        style={{ gridColumn: "1 / -1" }}
                    >
                        <Text className={styles.infoLabel}>接口描述</Text>
                        <Text>无</Text>
                    </div>
                </div>
            </Card>

            <Card className={styles.section} title={"请求参数"} bordered>
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
                        <pre className={styles.codeBlock}>
                            {tsRequestExample}
                        </pre>
                    </Card>
                )}
            </Card>

            <Divider style={{ margin: "16px 0" }} />

            <Card className={styles.section} title={"响应参数"} bordered>
                <div className={styles.subHeader}>
                    <Text>Body 参数</Text>
                    <Space>
                        <Button
                            type="text"
                            onClick={() => setExpandedRes((v) => !v)}
                        >
                            {expandedRes ? "收起示例" : "展开示例"}
                        </Button>
                        <Tag color="arcoblue">TypeScript</Tag>
                    </Space>
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
                        <pre className={styles.codeBlock}>
                            {tsResponseExample}
                        </pre>
                    </Card>
                )}
            </Card>
        </div>
    );
};

export default Detail;
