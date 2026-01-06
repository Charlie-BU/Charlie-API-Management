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
import { useService } from "@/hooks/useService";

const { Text } = Typography;

interface HeaderHandlers {
    setCurrentVersion: (v: string) => void;
    exitIteration: () => void;
}

interface HeaderProps {
    loading: boolean;
    serviceUuid: string;
    versions: { version: string; is_latest: boolean }[];
    isLatest: boolean;
    currentVersion: string;
    creator: UserProfile;
    inIteration: boolean;
    handlers: HeaderHandlers;
}

const Header: React.FC<HeaderProps> = (props) => {
    const {
        loading,
        serviceUuid,
        versions,
        isLatest,
        currentVersion,
        creator,
        inIteration,
        handlers: { setCurrentVersion, exitIteration },
    } = props;

    const { handleViewService } = useService();

    if (loading || !versions || !serviceUuid) {
        return null;
    }

    return (
        <div className={styles.serviceHeader}>
            {/* <Button
                type="default"
                status="danger"
                onClick={() =>
                    handleConfirm(
                        () => exitIteration(),
                        "退出迭代",
                        "确认退出当前迭代？"
                    )
                }
            >
                退出迭代
            </Button> */}
            <div style={{ cursor: "default" }}>
                <Breadcrumb>
                    <Breadcrumb.Item href="/">服务列表</Breadcrumb.Item>
                    <Breadcrumb.Item
                        href={
                            inIteration
                                ? `/service?uuid=${serviceUuid}`
                                : undefined
                        }
                        onClick={
                            inIteration
                                ? (e) => {
                                      e.preventDefault();
                                      exitIteration();
                                  }
                                : undefined
                        }
                    >
                        服务详情
                    </Breadcrumb.Item>
                    {inIteration && (
                        <Breadcrumb.Item>Service 迭代</Breadcrumb.Item>
                    )}
                </Breadcrumb>
            </div>
            <Space
                size={0}
                split={<Divider type="vertical" style={{ margin: "0 16px" }} />}
            >
                <Text
                    style={{ fontSize: 16, fontWeight: 600, cursor: "pointer" }}
                    onClick={() => handleViewService(serviceUuid)}
                >
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
