import { Tree, Input, Spin } from "@cloud-materials/common";
import styles from "./index.module.less";
import { useState } from "react";

const { Search } = Input;

const ApiList: React.FC<{
    treeData: any[];
    setSelectedApiId: (apiId: number) => void;
}> = (props) => {
    const { treeData, setSelectedApiId } = props;
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const handleSelectApi = (keys: string[]) => {
        const apiId = Number(keys[0]);
        setSelectedApiId(apiId);
        setSelectedKeys(keys);
    };

    if (!treeData || treeData.length === 0) {
        return (
            <div className={styles.loadingCenter}>
                <Spin dot />
            </div>
        );
    }

    return (
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
    );
};

export default ApiList;
