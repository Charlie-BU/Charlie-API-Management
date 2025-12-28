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
    ResponseParam,
    ResponseParamDraft,
} from "@/services/api/types";
import { genStatusCodeTag } from "@/utils";
import styles from "../index.module.less";

const { Text } = Typography;

const responseColumns = [
    {
        title: "参数名称",
        dataIndex: "name",
        width: 160,
        render: (v: string, record: ResponseParam | ResponseParamDraft) => {
            const childrenParams = record.children_params || [];
            if (!childrenParams || childrenParams.length === 0) {
                return v;
            }
            return (
                <Popover content="点击查看子参数">
                    <Popover
                        trigger="click"
                        content={
                            <Table<ResponseParam | ResponseParamDraft>
                                pagination={false}
                                columns={responseColumns as any}
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
        render: (v: string, record: ResponseParam | ResponseParamDraft) =>
            v === "array" && record.array_child_type ? (
                <Tag>
                    {v}
                    {"<"}
                    {record.array_child_type}
                    {">"}
                </Tag>
            ) : (
                <Tag>{v}</Tag>
            ),
    },
    {
        title: "是否必填",
        dataIndex: "required",
        width: 120,
        render: (v: boolean) => (
            <Tag color={v ? "red" : "gray"}>{v ? "必填" : "选填"}</Tag>
        ),
    },
    { title: "描述", dataIndex: "description", placeholder: "-" },
    {
        title: "默认值",
        dataIndex: "default_value",
        width: 200,
        placeholder: "-",
    },
    { title: "示例值", dataIndex: "example", width: 200, placeholder: "-" },
];

const ResponseParamsEdit = (props: { apiDetail: ApiDetail | ApiDraftDetail }) => {
    const { apiDetail } = props;
    const responseParamsByStatusCode: Record<
        number,
        ResponseParam[] | ResponseParamDraft[]
    > = apiDetail.response_params_by_status_code || {};
    const existCodes: number[] = Object.keys(responseParamsByStatusCode)
        .filter(
            (status) => responseParamsByStatusCode[Number(status)]?.length > 0
        )
        .map(Number)
        .sort((a, b) => a - b); // Object.keys()自动将key转换为string，需要手动转换为number，并排序

    return (
        <Space direction="vertical" size={12}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 响应参数
            </div>
            {existCodes.map((code) => (
                <Space direction="vertical" size={8} key={code}>
                    <Text>状态码：{genStatusCodeTag(code)}</Text>
                    <Table<ResponseParam | ResponseParamDraft>
                        pagination={false}
                        columns={responseColumns as any}
                        rowKey="name"
                        data={responseParamsByStatusCode[code]}
                        size="small"
                    />
                </Space>
            ))}
        </Space>
    );
};

export default ResponseParamsEdit;
