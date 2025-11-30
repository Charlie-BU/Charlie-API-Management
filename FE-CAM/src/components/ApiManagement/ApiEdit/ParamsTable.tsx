import React, { useState, useEffect } from 'react';
import {
    Table,
    Input,
    Select,
    Switch,
    Button,
    Space,
    IconPlus,
    IconDelete,
} from '@cloud-materials/common';

const generateId = () => Math.random().toString(36).substring(2, 9);

// Mock types since we might not have them or they might be different for editing
export interface ParamItem {
    id: string;
    name: string;
    type: string;
    required: boolean;
    description: string;
    example: string;
    children?: ParamItem[];
    // for array type
    array_child_type?: string;
}

interface ParamsTableProps {
    value?: ParamItem[];
    onChange?: (value: ParamItem[]) => void;
    isResponse?: boolean; // Response params might have different columns or logic
}

const TYPES = ['string', 'number', 'boolean', 'object', 'array', 'integer'];

const ParamsTable: React.FC<ParamsTableProps> = ({ value = [], onChange, isResponse }) => {
    const [data, setData] = useState<ParamItem[]>(value);

    useEffect(() => {
        setData(value);
    }, [value]);

    const handleChange = (newData: ParamItem[]) => {
        setData(newData);
        onChange?.(newData);
    };

    const updateItem = (id: string, field: keyof ParamItem, val: any, list: ParamItem[]): ParamItem[] => {
        return list.map(item => {
            if (item.id === id) {
                return { ...item, [field]: val };
            }
            if (item.children) {
                return { ...item, children: updateItem(id, field, val, item.children) };
            }
            return item;
        });
    };

    const handleFieldChange = (id: string, field: keyof ParamItem, val: any) => {
        const newData = updateItem(id, field, val, data);
        handleChange(newData);
    };

    const addItem = (parentId?: string) => {
        const newItem: ParamItem = {
            id: generateId(),
            name: '',
            type: 'string',
            required: true,
            description: '',
            example: '',
        };

        if (!parentId) {
            handleChange([...data, newItem]);
        } else {
            const addChildren = (list: ParamItem[]): ParamItem[] => {
                return list.map(item => {
                    if (item.id === parentId) {
                        return { ...item, children: [...(item.children || []), newItem] };
                    }
                    if (item.children) {
                        return { ...item, children: addChildren(item.children) };
                    }
                    return item;
                });
            };
            handleChange(addChildren(data));
        }
    };

    const deleteItem = (id: string) => {
        const deleteFromList = (list: ParamItem[]): ParamItem[] => {
            return list.filter(item => {
                if (item.id === id) return false;
                if (item.children) {
                    item.children = deleteFromList(item.children);
                }
                return true;
            });
        };
        handleChange(deleteFromList(data));
    };

    const columns = [
        {
            title: '参数名',
            dataIndex: 'name',
            width: 200,
            render: (col: string, record: ParamItem) => (
                <Input
                    value={record.name}
                    onChange={(v) => handleFieldChange(record.id, 'name', v)}
                    placeholder="参数名"
                />
            ),
        },
        {
            title: '参数类型',
            dataIndex: 'type',
            width: 150,
            render: (col: string, record: ParamItem) => (
                <Select
                    value={record.type}
                    onChange={(v) => handleFieldChange(record.id, 'type', v)}
                    options={TYPES.map(t => ({ label: t, value: t }))}
                />
            ),
        },
        {
            title: '是否必须',
            dataIndex: 'required',
            width: 100,
            render: (col: boolean, record: ParamItem) => (
                <Switch
                    checked={record.required}
                    onChange={(v) => handleFieldChange(record.id, 'required', v)}
                    checkedText="必须"
                    uncheckedText="非必"
                />
            ),
        },
        {
            title: '备注',
            dataIndex: 'description',
            render: (col: string, record: ParamItem) => (
                <Input
                    value={record.description}
                    onChange={(v) => handleFieldChange(record.id, 'description', v)}
                    placeholder="请输入备注"
                />
            ),
        },
        {
            title: '示例值',
            dataIndex: 'example',
            render: (col: string, record: ParamItem) => (
                <Input
                    value={record.example}
                    onChange={(v) => handleFieldChange(record.id, 'example', v)}
                    placeholder="请输入示例值"
                />
            ),
        },
        {
            title: '操作',
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
                    {(record.type === 'object' || record.type === 'array') && (
                        <Button size="mini" type="text">JSON 导入</Button>
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
