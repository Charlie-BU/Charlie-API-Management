import {
    Breadcrumb,
    Divider,
    Select,
    Space,
    Tag,
    Typography,
} from "@cloud-materials/common";

import styles from "./index.module.less";
import type { UserProfile } from "@/services/user/types";
import { userAvatar } from "@/utils";

const { Text } = Typography;

const Header: React.FC<{
    loading: boolean;
    serviceUuid: string;
    versions: { version: string; is_latest: boolean }[];
    isLatest: boolean;
    currentVersion: string;
    creator: UserProfile;
    setCurrentVersion: (v: string) => void;
}> = (props) => {
    const {
        loading,
        serviceUuid,
        versions,
        isLatest,
        currentVersion,
        creator,
        setCurrentVersion,
    } = props;

    if (loading || !versions || !serviceUuid) {
        return null;
    }

    return (
        <div className={styles.serviceHeader}>
            <div>
                <Breadcrumb>
                    <Breadcrumb.Item href="/">服务列表</Breadcrumb.Item>
                    <Breadcrumb.Item>服务详情</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <Space
                size={0}
                split={<Divider type="vertical" style={{ margin: "0 16px" }} />}
            >
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
                    prefix={
                        isLatest ? (
                            <Tag
                                size="small"
                                color="green"
                                style={{ marginRight: 8 }}
                            >
                                最新版本
                            </Tag>
                        ) : (
                            <Tag
                                size="small"
                                color="blue"
                                style={{ marginRight: 8 }}
                            >
                                非最新版本
                            </Tag>
                        )
                    }
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
                                    {/* {item.is_latest && (
                                        <Tag size="small" color="green">
                                            最新版本
                                        </Tag>
                                    )} */}
                                </Space>
                            </Select.Option>
                        ))}
                </Select>
                <span>{userAvatar(creator, 32)}</span>
            </Space>
        </div>
    );
};

export default Header;
