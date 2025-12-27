import React from "react";
import {
    Table,
    Input,
    Select,
    Switch,
    Button,
    Space,
} from "@cloud-materials/common";
import { IconPlus, IconDelete } from "@cloud-materials/common";
import { TYPES } from "./types";
import type { ParamItem } from "./types";
import {
    updateTreeItem,
    addTreeItem,
    deleteTreeItem,
} from "./utils";

interface ParamsTableProps {
    value?: ParamItem[];
    onChange?: (value: ParamItem[]) => void;
    isResponse?: boolean;
}

const ParamsTable: React.FC<ParamsTableProps> = ({
    value = [],
    onChange,
    isResponse,
}) => {
    const data = value;

    const handleChange = (newData: ParamItem[]) => {
        onChange?.(newData);
    };

    const handleFieldChange = (
        id: string,
        field: keyof ParamItem,
        val: any
    ) => {
        const newData = updateTreeItem(data, id, field, val);
        handleChange(newData);
    };

    const addItem = (parentId?: string) => {
        const newData = addTreeItem(data, parentId);
        handleChange(newData);
    };

    const deleteItem = (id: string) => {
        const newData = deleteTreeItem(data, id);
        handleChange(newData);
    };

    const columns = [
        {
            title: "参数名",
            dataIndex: "name",
            width: 200,
            render: (_col: string, record: ParamItem) => (
                <Input
                    value={record.name}
                    onChange={(v) => handleFieldChange(record.id, "name", v)}
                    placeholder="参数名"
                />
            ),
        },
        {
            title: "参数类型",
            dataIndex: "type",
            width: 150,
            render: (_col: string, record: ParamItem) => (
                <Select
                    value={record.type}
                    onChange={(v) => handleFieldChange(record.id, "type", v)}
                    options={TYPES.map((t) => ({ label: t, value: t }))}
                />
            ),
        },
        {
            title: "是否必须",
            dataIndex: "required",
            width: 100,
            render: (_col: boolean, record: ParamItem) => (
                <Switch
                    checked={record.required}
                    onChange={(v) =>
                        handleFieldChange(record.id, "required", v)
                    }
                    checkedText="必须"
                    uncheckedText="非必"
                />
            ),
        },
        {
            title: "备注",
            dataIndex: "description",
            render: (_col: string, record: ParamItem) => (
                <Input
                    value={record.description}
                    onChange={(v) =>
                        handleFieldChange(record.id, "description", v)
                    }
                    placeholder="请输入备注"
                />
            ),
        },
        {
            title: "示例值",
            dataIndex: "example",
            render: (_col: string, record: ParamItem) => (
                <Input
                    value={record.example}
                    onChange={(v) => handleFieldChange(record.id, "example", v)}
                    placeholder="请输入示例值"
                />
            ),
        },
        {
            title: "操作",
            width: 200,
            render: (_: any, record: ParamItem) => (
                <Space>
                    <Button
                        icon={<IconPlus />}
                        size="mini"
                        onClick={() => addItem(record.id)}
                        type="text"
                    />
                    <Button
                        icon={<IconDelete />}
                        size="mini"
                        onClick={() => deleteItem(record.id)}
                        type="text"
                        status="danger"
                    />
                    {(record.type === "object" || record.type === "array") && (
                        <Button size="mini" type="text">
                            JSON 导入
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Table
                columns={columns}
                data={data}
                rowKey="id"
                pagination={false}
                defaultExpandAllRows
                size="small"
                border={false}
            />
            <Button
                style={{ marginTop: 8 }}
                type="dashed"
                long
                icon={<IconPlus />}
                onClick={() => addItem()}
            >
                添加参数
            </Button>
        </div>
    );
};

export default ParamsTable;
