import { useState, useEffect } from "react";
import { Tree, Input, Spin } from "@cloud-materials/common";

import styles from "./index.module.less";

const { Search } = Input;

const ApiList: React.FC<{
    treeData: any[];
    setSelectedApiId: (apiId: number) => void;
}> = (props) => {
    const { treeData, setSelectedApiId } = props;
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

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
