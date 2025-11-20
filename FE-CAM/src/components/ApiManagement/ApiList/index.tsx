import { useState, useEffect } from "react";
import { Tree, Input, Space, Dropdown, Menu } from "@cloud-materials/common";

import styles from "../index.module.less";

const { Search } = Input;

const ApiList: React.FC<{
    treeData: any[];
    setSelectedApiId: (apiId: number) => void;
    handleAddCategory: () => void;
}> = (props) => {
    const { treeData, setSelectedApiId, handleAddCategory } = props;
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
                    treeData={treeData}
                    selectedKeys={selectedKeys}
                    autoExpandParent
                    blockNode
                    draggable
                    onSelect={handleSelectApi}
                    onDrop={({ dragNode, dropNode, dropPosition }) => {
                        console.log(dragNode, dropNode, dropPosition);
                    }}
                />
            )}
        </div>
    );
};

export default ApiList;
