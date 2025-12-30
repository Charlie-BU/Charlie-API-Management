import React, { useMemo } from "react";
import {
    Space,
    Input,
    Popover,
    Button,
    IconCommon,
    Select,
    Switch,
    IconPlus,
    IconDelete,
    Table,
} from "@cloud-materials/common";
import { PARAM_TYPES } from "./types";
import { generateId } from "./utils";

const { Option } = Select;

interface ParamTableProps {
    type: "request" | "response";
    value?: any[];
    onChange?: (value: any[]) => void;
    readOnly?: boolean;
}

const ParamTable: React.FC<ParamTableProps> = ({
    type,
    value = [],
    onChange,
    readOnly = false,
}) => {
    const handleFieldChange = (
        id: string | number,
        field: string,
        val: any
    ) => {
        const newData = value.map((item) => {
            if (item.id === id) {
                return { ...item, [field]: val };
            }
            return item;
        });
        onChange?.(newData);
    };

    const handleRemove = (id: string | number) => {
        const newData = value.filter((item) => item.id !== id);
        onChange?.(newData);
    };

    const handleAdd = () => {
        const newItem: any = {
            id: generateId(),
            name: "",
            type: "string",
            required: false,
            description: "",
            default_value: "",
            example: "",
        };
        onChange?.([...value, newItem]);
    };

    const hasArrayParam = useMemo(
        () => value.some((item) => item.type === "array"),
        [value]
    );

    const columns = [
        {
            title: "参数名称",
            dataIndex: "name",
            width: 220,
            fixed: "left" as const,
            render: (val: string, record: any) => {
                const showSubParams =
                    (record.children_params &&
                        record.children_params.length > 0) ||
                    record.type === "object";
                return (
                    <Space size={4}>
                        <Input
                            placeholder="参数名称"
                            value={val}
                            onChange={(v) =>
                                handleFieldChange(record.id, "name", v)
                            }
                            disabled={readOnly}
                            style={{ width: showSubParams && 120 }}
                        />
                        {showSubParams && (
                            <Popover
                                trigger="click"
                                content={
                                    <div
                                        style={{
                                            width: 1000,
                                            maxWidth: 1000,
                                        }}
                                    >
                                        <ParamTable
                                            type={type}
                                            value={record.children_params || []}
                                            onChange={(newChildren) =>
                                                handleFieldChange(
                                                    record.id,
                                                    "children_params",
                                                    newChildren
                                                )
                                            }
                                            readOnly={readOnly}
                                        />
                                    </div>
                                }
                            >
                                <Button type="text" size="mini">
                                    <Space size={4}>
                                        <IconCommon />
                                        子参数
                                    </Space>
                                </Button>
                            </Popover>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "参数类型",
            dataIndex: "type",
            width: hasArrayParam ? 260 : 150,
            render: (val: string, record: any) => (
                <Space size={4}>
                    <Select
                        placeholder="类型"
                        style={{ width: 120 }}
                        value={val}
                        onChange={(v) => {
                            handleFieldChange(record.id, "type", v);
                        }}
                        disabled={readOnly}
                    >
                        {PARAM_TYPES.map((t) => (
                            <Option key={t} value={t}>
                                {t}
                            </Option>
                        ))}
                    </Select>
                    {val === "array" && (
                        <Select
                            placeholder="子类型"
                            style={{ width: 120 }}
                            value={record.array_child_type}
                            onChange={(v) =>
                                handleFieldChange(
                                    record.id,
                                    "array_child_type",
                                    v
                                )
                            }
                            disabled={readOnly}
                        >
                            {PARAM_TYPES.map((t) => (
                                <Option key={t} value={t}>
                                    {t}
                                </Option>
                            ))}
                        </Select>
                    )}
                </Space>
            ),
        },
        {
            title: "是否必填",
            dataIndex: "required",
            width: 100,
            render: (val: boolean, record: any) => (
                <Switch
                    checked={val}
                    checkedText="必填"
                    uncheckedText="选填"
                    onChange={(v) =>
                        handleFieldChange(record.id, "required", v)
                    }
                    disabled={readOnly}
                />
            ),
        },
        {
            title: "描述",
            dataIndex: "description",
            render: (val: string, record: any) => (
                <Input
                    placeholder="描述"
                    value={val}
                    onChange={(v) =>
                        handleFieldChange(record.id, "description", v)
                    }
                    disabled={readOnly}
                />
            ),
        },
        ...(type === "request"
            ? [
                  {
                      title: "默认值",
                      dataIndex: "default_value",
                      render: (val: string, record: any) => (
                          <Input
                              placeholder="默认值"
                              value={val}
                              onChange={(v) =>
                                  handleFieldChange(
                                      record.id,
                                      "default_value",
                                      v
                                  )
                              }
                              disabled={readOnly}
                          />
                      ),
                  },
              ]
            : []),
        {
            title: "示例值",
            dataIndex: "example",
            render: (val: string, record: any) => (
                <Input
                    placeholder="示例值"
                    value={val}
                    onChange={(v) => handleFieldChange(record.id, "example", v)}
                    disabled={readOnly}
                />
            ),
        },
        {
            title: "操作",
            dataIndex: "operation",
            width: 100,
            fixed: "right" as const,
            render: (_: any, record: any) => (
                <Space>
                    {record.type === "object" && (
                        <Button
                            type="outline"
                            shape="circle"
                            size="mini"
                            icon={<IconPlus />}
                            onClick={() => {
                                const currentChildren =
                                    record.children_params || [];
                                const newChild = {
                                    id: generateId(),
                                    name: "",
                                    type: "string",
                                    required: false,
                                };
                                handleFieldChange(
                                    record.id,
                                    "children_params",
                                    [...currentChildren, newChild]
                                );
                            }}
                            disabled={readOnly}
                        />
                    )}
                    <Button
                        type="outline"
                        shape="circle"
                        status="danger"
                        size="mini"
                        icon={<IconDelete />}
                        onClick={() => handleRemove(record.id)}
                        disabled={readOnly}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical">
            <Table
                pagination={false}
                columns={columns}
                data={value}
                rowKey="id"
                size="small"
                border={false}
                scroll={{ x: 1200 }}
                noDataElement={<></>}
            />
            {!readOnly && (
                <Button
                    type="dashed"
                    long
                    onClick={handleAdd}
                    icon={<IconPlus />}
                >
                    添加参数
                </Button>
            )}
        </Space>
    );
};

export default ParamTable;
