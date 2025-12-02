import { useState, useEffect } from "react";
import {
    Tree,
    Input,
    Space,
    Dropdown,
    Menu,
    Button,
    IconDelete,
} from "@cloud-materials/common";

import styles from "../index.module.less";

const { Search } = Input;

const ApiList: React.FC<{
    inIteration: boolean;
    treeData: any[];
    setSelectedApiId: (apiId: number) => void;
    handleAddCategory: () => void;
    handleUpdateApiCategory: (apiId: number, categoryId: number) => void;
    handleDeleteCategory: (categoryId: number) => void;
    handleStartIteration: () => void;
}> = (props) => {
    const {
        inIteration,
        treeData,
        setSelectedApiId,
        handleAddCategory,
        handleUpdateApiCategory,
        handleDeleteCategory,
        handleStartIteration,
    } = props;
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const otherOperations = (
        <Menu style={{ width: 100 }}>
            <Menu.Item key="1" onClick={handleAddCategory}>
                添加分类
            </Menu.Item>
        </Menu>
    );

    const firstOptionKey: string = (() => {
        const first = treeData[0];
        if (!first) return "";
        const childKey = first.children?.[0]?.key;
        const key = childKey ?? first.key;
        if (key == null) return "";
        if (Number.isNaN(Number(key))) return "";
        return typeof key === "string" ? key : key.toString();
    })();

    const handleSelectApi = (keys: string[]) => {
        const apiId = Number(keys[0]);
        if (!Number.isNaN(apiId) && apiId > 0) {
            setSelectedApiId(apiId);
        } else {
            setSelectedApiId(-1);
        }
        setSelectedKeys(keys);
    };

    useEffect(() => {
        handleSelectApi([firstOptionKey]);
    }, [firstOptionKey]);

    const handleDrag = (info: any) => {
        // 迭代过程中不可拖拽 API 更换分类
        if (inIteration) {
            return;
        }
        const { dragNode, dropNode } = info;
        const apiId = Number(dragNode.key);
        let categoryId = -1;
        if (dropNode.key.startsWith("category-")) {
            // 若拖拽目标是分类节点，直接使用分类 ID
            if (dropNode.key === "category-null") {
                // 若拖拽目标是未分类节点，分类 ID 设为 -1
                categoryId = -1;
            } else {
                categoryId = Number(dropNode.key.replace("category-", ""));
            }
        } else {
            // 若拖拽目标不是分类节点，获取其父分类 ID
            const category = dropNode.props.parentKey;
            if (!category || !category.startsWith("category-")) {
                return;
            }
            if (category === "category-null") {
                // 若拖拽目标是未分类节点，分类 ID 设为 -1
                categoryId = -1;
            } else {
                categoryId = Number(category.replace("category-", ""));
            }
        }
        if (!apiId || apiId === Number.NaN) {
            return;
        }
        // 若当前 API 已属于该分类，无需更新
        if (
            dragNode.props.parentKey === dropNode.key ||
            dragNode.props.parentKey === dropNode.props.parentKey
        ) {
            return;
        }
        handleUpdateApiCategory(apiId, categoryId);
    };

    if (!treeData || treeData.length === 0) {
        return null;
    }

    return (
        <div className={styles.sidebar}>
            <Space className={styles.search}>
                <Search allowClear placeholder="搜索 API" />
                {inIteration ? (
                    <Dropdown.Button
                        type="outline"
                        droplist={otherOperations}
                        position="bl"
                        trigger="click"
                    >
                        创建 API
                    </Dropdown.Button>
                ) : (
                    <Button type="outline" onClick={handleStartIteration}>
                        发起迭代
                    </Button>
                )}
            </Space>

            {/* autoExpandParent只有在Tree初次挂载时生效，所以要在treeData计算完成后再渲染 */}
            {treeData.length > 0 && (
                <Tree
                    className={styles.tree}
                    selectedKeys={selectedKeys}
                    treeData={treeData}
                    autoExpandParent
                    blockNode
                    draggable={!inIteration}
                    onSelect={handleSelectApi}
                    onDrop={handleDrag}
                    renderExtra={(node) => {
                        if (
                            !node.draggable &&
                            !node.selectable &&
                            !node.childrenData?.length &&
                            node._key !== "category-null"
                        ) {
                            // 没有子节点的 category 节点（不包括未分类节点）
                            return (
                                <Button
                                    onClick={() =>
                                        handleDeleteCategory(
                                            Number(
                                                node?._key?.replace(
                                                    "category-",
                                                    ""
                                                ) ?? -1
                                            )
                                        )
                                    }
                                    type="outline"
                                    status="danger"
                                    shape="circle"
                                    size="mini"
                                    className={styles.nodeDelete}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                    }}
                                    icon={<IconDelete />}
                                />
                            );
                        }
                        return null;
                    }}
                />
            )}
        </div>
    );
};

export default ApiList;
