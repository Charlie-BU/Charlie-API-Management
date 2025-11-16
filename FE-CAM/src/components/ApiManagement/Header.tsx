import {
    Breadcrumb,
    Divider,
    Select,
    Space,
    Spin,
    Tag,
    Typography,
} from "@cloud-materials/common";

import styles from "./index.module.less";

const { Text } = Typography;

const Header: React.FC<{
    loading: boolean;
    serviceUuid: string;
    versions: { version: string; is_latest: boolean }[];
    currentVersion: string;
    setCurrentVersion: (v: string) => void;
}> = (props) => {
    const {
        loading,
        serviceUuid,
        versions,
        currentVersion,
        setCurrentVersion,
    } = props;

    if (loading || !versions || !serviceUuid) {
        return (
            <div className={styles.loadingCenter}>
                <Spin dot />
            </div>
        );
    }

    return (
        <div className={styles.serviceHeader}>
            <div>
                <Breadcrumb>
                    <Breadcrumb.Item href="/">服务列表</Breadcrumb.Item>
                    <Breadcrumb.Item>服务详情</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <Space size={0} split={<Divider type="vertical" />}>
                <Text style={{ fontSize: 16, fontWeight: 600 }}>
                    {serviceUuid}
                </Text>
                <Select
                    bordered={false}
                    size="large"
                    value={currentVersion}
                    onChange={(value) => {
                        setCurrentVersion(value);
                    }}
                    triggerProps={{
                        autoAlignPopupWidth: false,
                        autoAlignPopupMinWidth: true,
                        position: "bl",
                    }}
                    style={{
                        color: "#000",
                        fontWeight: 600,
                    }}
                >
                    {versions &&
                        versions.map((item) => (
                            <Select.Option
                                key={item.version}
                                value={item.version}
                            >
                                <Space>
                                    <Text className={styles.serviceVersion}>
                                        {item.version}
                                    </Text>
                                    {item.is_latest && (
                                        <Tag size="small" color="green">
                                            最新版本
                                        </Tag>
                                    )}
                                </Space>
                            </Select.Option>
                        ))}
                </Select>
            </Space>
        </div>
    );
};

export default Header;
