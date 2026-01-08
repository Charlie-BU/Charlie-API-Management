import {
    IconCommon,
    Popover,
    Space,
    Table,
    Tag,
    Typography,
} from "@cloud-materials/common";

import type {
    ApiDetail,
    ApiDraftDetail,
    ParamType,
    RequestParam,
    RequestParamDraft,
} from "@/services/api/types";
import styles from "../index.module.less";
import { getParamTypeTag } from "./utils";

const { Text } = Typography;

const requestColumns = [
    {
        title: "参数名称",
        dataIndex: "name",
        width: 160,
        render: (v: string, record: RequestParam | RequestParamDraft) => {
            const childrenParams = record.children_params || [];
            if (!childrenParams || childrenParams.length === 0) {
                return v;
            }
            const popoverText =
                record.type === "array" && record.array_child_type === "object"
                    ? "点击查看数组元素子参数"
                    : "点击查看子参数";
            return (
                <Popover content={popoverText}>
                    <Popover
                        trigger="click"
                        content={
                            <Table<RequestParam | RequestParamDraft>
                                pagination={false}
                                columns={requestColumns as any}
                                rowKey="name"
                                data={childrenParams}
                                size="small"
                            />
                        }
                        style={{ width: 1000, maxWidth: 1000 }}
                    >
                        <Text
                            type="primary"
                            className={styles.hasChildParamTitle}
                        >
                            {v}
                        </Text>
                    </Popover>
                </Popover>
            );
        },
    },
    {
        title: "参数类型",
        dataIndex: "type",
        width: 150,
        render: (v: ParamType, record: RequestParam | RequestParamDraft) =>
            getParamTypeTag(v, record.array_child_type ?? undefined),
    },
    {
        title: "是否必填",
        dataIndex: "required",
        width: 120,
        render: (v: boolean) => (
            <Tag color={v ? "red" : "gray"}>{v ? "必填" : "选填"}</Tag>
        ),
    },
    { title: "描述", dataIndex: "description", width: 240, placeholder: "-" },
    {
        title: "默认值",
        dataIndex: "default_value",
        width: 200,
        placeholder: "-",
    },
    { title: "示例值", dataIndex: "example", width: 200, placeholder: "-" },
];

const RequestParams = (props: { apiDetail: ApiDetail | ApiDraftDetail }) => {
    const { apiDetail } = props;
    const requestParamsByLocation: Record<
        string,
        RequestParam[] | RequestParamDraft[]
    > = apiDetail.request_params_by_location || {};
    const existLocations = Object.keys(requestParamsByLocation).filter(
        (location) => requestParamsByLocation[location]?.length > 0
    );

    return (
        <Space direction="vertical" size={12}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 请求参数
            </div>
            {existLocations.includes("query") && (
                <Space direction="vertical" size={8}>
                    <Text>Query 参数</Text>
                    <Table<RequestParam | RequestParamDraft>
                        pagination={false}
                        columns={requestColumns as any}
                        rowKey="name"
                        data={requestParamsByLocation["query"]}
                        size="small"
                    />
                </Space>
            )}
            {existLocations.includes("path") && (
                <Space direction="vertical" size={8}>
                    <Text>Path 参数</Text>
                    <Table<RequestParam | RequestParamDraft>
                        pagination={false}
                        columns={requestColumns as any}
                        rowKey="name"
                        data={requestParamsByLocation["path"]}
                        size="small"
                    />
                </Space>
            )}
            {existLocations.includes("body") && (
                <Space direction="vertical" size={8}>
                    <Text>Body 参数</Text>
                    <Table<RequestParam | RequestParamDraft>
                        pagination={false}
                        columns={requestColumns as any}
                        rowKey="name"
                        data={requestParamsByLocation["body"]}
                        size="small"
                    />
                </Space>
            )}
            {existLocations.includes("header") && (
                <Space direction="vertical" size={8}>
                    <Text>Header 参数</Text>
                    <Table<RequestParam | RequestParamDraft>
                        pagination={false}
                        columns={requestColumns as any}
                        rowKey="name"
                        data={requestParamsByLocation["header"]}
                        size="small"
                    />
                </Space>
            )}
            {existLocations.includes("cookie") && (
                <Space direction="vertical" size={8}>
                    <Text>Cookie 参数</Text>
                    <Table<RequestParam | RequestParamDraft>
                        pagination={false}
                        columns={requestColumns as any}
                        rowKey="name"
                        data={requestParamsByLocation["cookie"]}
                        size="small"
                    />
                </Space>
            )}
        </Space>
    );
};

export default RequestParams;
