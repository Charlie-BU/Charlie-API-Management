import React, { useMemo, useState } from "react";
import {
    Typography,
    Button,
    Tag,
    Table,
    Tree,
    Input,
    Space,
    Card,
    Divider,
    Avatar,
    Breadcrumb,
    Select,
    Spin,
} from "@cloud-materials/common";
import styles from "./index.module.less";
import { useSearchParams } from "react-router-dom";
import { useThisService } from "@/hooks/useService";

const { Title, Text } = Typography;
const { Search } = Input;

// const apiTreeData = [
//     {
//         key: "group-user",
//         title: <Text style={{ fontWeight: 600 }}>User</Text>,
//         children: [
//             {
//                 key: "post-login",
//                 title: (
//                     <Space size={8} align="center">
//                         <Tag color="green">POST1</Tag>
//                         <Text>/v1/user/login</Text>
//                     </Space>
//                 ),
//             },
//             {
//                 key: "post-register",
//                 title: (
//                     <Space size={8} align="center">
//                         <Tag color="green">POST</Tag>
//                         <Text>/v1/user/register</Text>
//                     </Space>
//                 ),
//             },
//             {
//                 key: "get-user-by-id",
//                 title: (
//                     <Space size={8} align="center">
//                         <Tag color="blue">GET</Tag>
//                         <Text>/v1/user/getUserById</Text>
//                     </Space>
//                 ),
//             },
//         ],
//     },
//     {
//         key: "group-service",
//         title: <Text style={{ fontWeight: 600 }}>Service</Text>,
//         children: [
//             {
//                 key: "service-api",
//                 title: (
//                     <Space size={8} align="center">
//                         <Tag color="purple">Service</Tag>
//                         <Text>Api</Text>
//                     </Space>
//                 ),
//             },
//         ],
//     },
//     {
//         key: "group-uncategorized",
//         title: <Text style={{ fontWeight: 600 }}>未分类</Text>,
//     },
// ];

// 请求参数静态数据

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

const ApiManagement: React.FC = () => {
    const [searchParams] = useSearchParams();
    const uuid = searchParams.get("uuid") || "";
    const {
        loading,
        versions,
        currentVersion,
        isLatest,
        serviceDetail,
        treeData,
        setCurrentVersion,
    } = useThisService(uuid);

    const serviceUuid = useMemo(() => {
        return "service_uuid" in serviceDetail
            ? serviceDetail.service_uuid
            : serviceDetail?.service?.service_uuid;
    }, [serviceDetail]);

    const handleSelectApi = (keys: string[]) => {
        const apiId = Number(keys[0]);
        setSelectedApiId(apiId);
        setSelectedKeys(keys);
    };

    const [expandedReq, setExpandedReq] = useState(true);
    const [expandedRes, setExpandedRes] = useState(false);
    const [selectedApiId, setSelectedApiId] = useState<number>(-1);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    if (loading) {
        return (
            <div className={styles.loadingCenter}>
                <Spin dot />
            </div>
        );
    }

    return (
        <>
            <div className={styles.serviceHeader}>
                <div>
                    <Breadcrumb>
                        <Breadcrumb.Item href="/">服务列表</Breadcrumb.Item>
                        <Breadcrumb.Item>服务详情</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <Space size={0} split={<Divider type="vertical" />}>
                    <Text style={{ fontSize: 16, fontWeight: 600 }}>
                        {serviceUuid}
                    </Text>
                    <Select
                        bordered={false}
                        size="large"
                        value={currentVersion}
                        onChange={(value) => {
                            setCurrentVersion(value);
                        }}
                        triggerProps={{
                            autoAlignPopupWidth: false,
                            autoAlignPopupMinWidth: true,
                            position: "bl",
                        }}
                        style={{
                            color: "#000",
                            fontWeight: 600,
                        }}
                    >
                        {versions &&
                            versions.map((item) => (
                                <Select.Option
                                    key={item.version}
                                    value={item.version}
                                >
                                    <Space>
                                        <Text className={styles.serviceVersion}>
                                            {item.version}
                                        </Text>
                                        {item.is_latest && (
                                            <Tag size="small" color="green">
                                                最新版本
                                            </Tag>
                                        )}
                                    </Space>
                                </Select.Option>
                            ))}
                    </Select>
                </Space>
            </div>
            <div className={styles.apiPage}>
                {/* 左侧 API 列表 */}
                <div className={styles.sidebar}>
                    <Search
                        className={styles.search}
                        allowClear
                        placeholder="搜索 API"
                    />
                    {/* autoExpandParent只有在Tree初次挂载时生效，所以要在treeData计算完成后再渲染 */}
                    {treeData.length > 0 && (
                        <Tree
                            className={styles.tree}
                            selectedKeys={selectedKeys}
                            autoExpandParent={true}
                            blockNode={true}
                            onSelect={handleSelectApi}
                            treeData={treeData}
                        />
                    )}
                </div>
                {/* 右侧详情 */}
                <div className={styles.content}>
                    <div className={styles.header}>
                        <Title heading={5} className={styles.pathTitle}>
                            {/* {headerText} */}
                        </Title>
                        <Space>
                            <Button type="secondary">编辑</Button>
                            <Button type="secondary">Mock</Button>
                            <Button type="primary">测试</Button>
                        </Space>
                    </div>

                    <Card
                        className={styles.section}
                        title={"接口信息"}
                        bordered
                    >
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <Text className={styles.infoLabel}>
                                    接口名称中文
                                </Text>
                                <Text>login</Text>
                            </div>
                            <div className={styles.infoItem}>
                                <Text className={styles.infoLabel}>
                                    接口 owner
                                </Text>
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
                                <Text className={styles.infoLabel}>
                                    接口等级
                                </Text>
                                <Tag color="red">P0</Tag>
                            </div>
                            <div className={styles.infoItem}>
                                <Text className={styles.infoLabel}>
                                    接口标签
                                </Text>
                                <Text>无</Text>
                            </div>
                            <div
                                className={styles.infoItem}
                                style={{ gridColumn: "1 / -1" }}
                            >
                                <Text className={styles.infoLabel}>
                                    接口描述
                                </Text>
                                <Text>无</Text>
                            </div>
                        </div>
                    </Card>

                    <Card
                        className={styles.section}
                        title={"请求参数"}
                        bordered
                    >
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

                    <Card
                        className={styles.section}
                        title={"响应参数"}
                        bordered
                    >
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
            </div>
        </>
    );
};

export default ApiManagement;
