import { useState, useEffect } from "react";
import { Tree, Input, Space, Dropdown, Menu } from "@cloud-materials/common";

import styles from "../index.module.less";

const { Search } = Input;

const ApiList: React.FC<{
    treeData: any[];
    setSelectedApiId: (apiId: number) => void;
    handleAddCategory: () => void;
    handleUpdateApiCategory: (apiId: number, categoryId: number) => void;
}> = (props) => {
    const {
        treeData,
        setSelectedApiId,
        handleAddCategory,
        handleUpdateApiCategory,
    } = props;
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const otherOperations = (
        <Menu>
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
        console.log(apiId, categoryId);
        handleUpdateApiCategory(apiId, categoryId);
    };

    if (!treeData || treeData.length === 0) {
        return null;
    }

    return (
        <div className={styles.sidebar}>
            <Space className={styles.search}>
                <Search allowClear placeholder="搜索 API" />
                <Dropdown.Button
                    type="outline"
                    droplist={otherOperations}
                    position="bl"
                    trigger="click"
                >
                    创建 API
                </Dropdown.Button>
            </Space>

            {/* autoExpandParent只有在Tree初次挂载时生效，所以要在treeData计算完成后再渲染 */}
            {treeData.length > 0 && (
                <Tree
                    className={styles.tree}
                    selectedKeys={selectedKeys}
                    treeData={treeData}
                    autoExpandParent
                    blockNode
                    draggable
                    onSelect={handleSelectApi}
                    onDrop={handleDrag}
                />
            )}
        </div>
    );
};

export default ApiList;
