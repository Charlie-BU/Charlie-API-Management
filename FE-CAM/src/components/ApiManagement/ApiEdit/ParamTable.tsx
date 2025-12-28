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
    Form,
} from "@cloud-materials/common";
import { PARAM_TYPES } from "./types";

const { Option } = Select;

const ParamTable = ({
    name,
    parentName, // For identifying nesting depth if needed
}: {
    name: (string | number)[];
    parentName?: string;
}) => {
    const { form } = Form.useFormContext();

    const toPath = (path: (string | number)[]) => path.join(".");

    const getColumns = (
        baseName: (string | number)[],
        _add: (defaultValue?: any, index?: number) => void,
        remove: (index: number) => void
    ) => [
        {
            title: "参数名称",
            dataIndex: "name",
            width: 200,
            render: (_: any, field: any) => {
                const fieldName = [...baseName, field.name, "name"];

                return (
                    <Space>
                        <Form.Item
                            field={toPath(fieldName)}
                            noStyle
                            rules={[{ required: true, message: "请输入名称" }]}
                        >
                            <Input
                                placeholder="参数名称"
                                style={{ width: 140 }}
                            />
                        </Form.Item>

                        <Form.Item
                            noStyle
                            shouldUpdate={(_prev, _curr) => true}
                        >
                            {() => {
                                const children = form.getFieldValue(
                                    toPath([
                                        ...baseName,
                                        field.name,
                                        "children_params",
                                    ])
                                );
                                if (children && children.length > 0) {
                                    return (
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
                                                        name={[
                                                            ...baseName,
                                                            field.name,
                                                            "children_params",
                                                        ]}
                                                    />
                                                </div>
                                            }
                                        >
                                            <Button
                                                type="text"
                                                size="mini"
                                                icon={<IconCommon />} // Using IconCommon as placeholder for "View Children"
                                            >
                                                子参数
                                            </Button>
                                        </Popover>
                                    );
                                }
                                return null;
                            }}
                        </Form.Item>
                    </Space>
                );
            },
        },
        {
            title: "参数类型",
            dataIndex: "type",
            width: 200,
            render: (_: any, field: any) => (
                <Space>
                    <Form.Item
                        field={toPath([...baseName, field.name, "type"])}
                        noStyle
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="类型" style={{ width: 100 }}>
                            {PARAM_TYPES.map((t) => (
                                <Option key={t} value={t}>
                                    {t}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item noStyle shouldUpdate={(_prev, _curr) => true}>
                        {() => {
                            const type = form.getFieldValue(
                                toPath([...baseName, field.name, "type"])
                            );
                            if (type === "array") {
                                return (
                                    <Form.Item
                                        field={toPath([
                                            ...baseName,
                                            field.name,
                                            "array_child_type",
                                        ])}
                                        noStyle
                                    >
                                        <Select
                                            placeholder="子类型"
                                            style={{ width: 100 }}
                                        >
                                            {PARAM_TYPES.map((t) => (
                                                <Option key={t} value={t}>
                                                    {t}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                );
                            }
                            return null;
                        }}
                    </Form.Item>
                </Space>
            ),
        },
        {
            title: "是否必填",
            dataIndex: "required",
            width: 100,
            render: (_: any, field: any) => (
                <Form.Item
                    field={toPath([...baseName, field.name, "required"])}
                    noStyle
                    initialValue={false}
                    triggerPropName="checked"
                >
                    <Switch checkedText="必填" uncheckedText="选填" />
                </Form.Item>
            ),
        },
        {
            title: "描述",
            dataIndex: "description",
            width: 200,
            render: (_: any, field: any) => (
                <Form.Item
                    field={toPath([...baseName, field.name, "description"])}
                    noStyle
                >
                    <Input placeholder="描述" />
                </Form.Item>
            ),
        },
        {
            title: "默认值",
            dataIndex: "default_value",
            width: 120,
            render: (_: any, field: any) => (
                <Form.Item
                    field={toPath([...baseName, field.name, "default_value"])}
                    noStyle
                >
                    <Input placeholder="默认值" />
                </Form.Item>
            ),
        },
        {
            title: "示例值",
            dataIndex: "example",
            width: 150,
            render: (_: any, field: any) => (
                <Form.Item
                    field={toPath([...baseName, field.name, "example"])}
                    noStyle
                >
                    <Input placeholder="示例值" />
                </Form.Item>
            ),
        },
        {
            title: "操作",
            dataIndex: "operation",
            width: 100,
            render: (_: any, field: any) => (
                <Space>
                    <Form.Item noStyle shouldUpdate={(_prev, _curr) => true}>
                        {() => {
                            const type = form.getFieldValue(
                                toPath([...baseName, field.name, "type"])
                            );
                            if (type === "object") {
                                return (
                                    <Button
                                        type="outline"
                                        shape="circle"
                                        size="mini"
                                        icon={<IconPlus />}
                                        onClick={() => {
                                            const currentPath = toPath([
                                                ...baseName,
                                                field.name,
                                                "children_params",
                                            ]);
                                            const currentChildren =
                                                form.getFieldValue(
                                                    currentPath
                                                ) || [];
                                            form.setFieldValue(currentPath, [
                                                ...currentChildren,
                                                {
                                                    name: "",
                                                    type: "string",
                                                    required: false,
                                                },
                                            ]);
                                        }}
                                    />
                                );
                            }
                            return null;
                        }}
                    </Form.Item>
                    <Button
                        type="outline"
                        shape="circle"
                        status="danger"
                        size="mini"
                        icon={<IconDelete />}
                        onClick={() => remove(field.name)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Form.List field={toPath(name)}>
            {(fields, { add, remove }) => (
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Table
                        pagination={false}
                        columns={getColumns(name, add, remove)}
                        data={fields}
                        rowKey="key"
                        size="small"
                        border={false}
                    />
                    <Button
                        type="dashed"
                        long
                        onClick={() =>
                            add({ name: "", type: "string", required: false })
                        }
                        icon={<IconPlus />}
                    >
                        添加参数
                    </Button>
                </Space>
            )}
        </Form.List>
    );
};

export default ParamTable;
