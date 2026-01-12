import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import {
    Breadcrumb,
    Divider,
    IconLoading,
    IconUserGroup,
    Popover,
    Select,
    Space,
    Tag,
    Typography,
} from "@cloud-materials/common";

import styles from "./index.module.less";
import type { UserProfile, UserRole } from "@/services/user/types";
import { genUserRoleTag, userAvatar } from "@/utils";
import { useService } from "@/hooks/useService";
import { useUser } from "@/hooks/useUser";

const { Text } = Typography;

interface HeaderHandlers {
    setCurrentVersion: (v: string) => void;
    exitIteration: () => void;
    checkIsServiceMaintainer: (serviceId: number) => Promise<boolean>;
    handleAddOrRemoveServiceMaintainerById: (
        maintainerId: number
    ) => Promise<boolean>;
}

interface HeaderProps {
    loading: boolean;
    serviceUuid: string;
    versions: { version: string; is_latest: boolean }[];
    isLatest: boolean;
    currentVersion: string;
    personInCharge: UserProfile;
    maintainers: UserProfile[];
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
        personInCharge,
        maintainers,
        inIteration,
        handlers: {
            setCurrentVersion,
            exitIteration,
            checkIsServiceMaintainer,
            handleAddOrRemoveServiceMaintainerById,
        },
    } = props;

    const { handleViewService } = useService();
    const { user, getUserByUsernameOrNicknameOrEmail } = useUser();

    const isServiceOwnerOrIsL0 =
        personInCharge.id === user?.id || user?.level === 0;

    // 使用 ref 保持 fetch 函数的引用稳定，以配合 debounce 使用
    // 这样做既能避免闭包陷阱（stale closure），又能保证 debounce 实例在渲染间保持稳定
    const fetchUserRef = useRef(getUserByUsernameOrNicknameOrEmail);
    fetchUserRef.current = getUserByUsernameOrNicknameOrEmail;

    const [maintainersHere, setMaintainersHere] =
        useState<UserProfile[]>(maintainers);
    const [maintainerOptions, setMaintainerOptions] = useState<
        { label: React.ReactNode; value: UserProfile }[]
    >([]);

    useEffect(() => {
        setMaintainersHere(maintainers);
    }, [maintainers]);

    const getMaintainerOptions = async (inputValue: string) => {
        if (!inputValue || inputValue.length < 2) {
            setMaintainerOptions([]);
            return;
        }
        const res = await fetchUserRef.current(inputValue);
        // 把查询到的用户添加到选项中
        setMaintainerOptions(
            res.map((user) => ({
                label: (
                    <Space>
                        {genUserRoleTag(user.role as UserRole)}
                        <span>
                            {user.nickname} ({user.username}) - {user.email}
                        </span>
                    </Space>
                ),
                value: user,
            }))
        );
        // 检查查询到的用户是否是服务维护人，如果是则添加到维护人列表中
        for (const user of res) {
            const isMaintainer = await checkIsServiceMaintainer(user.id);
            if (isMaintainer) {
                setMaintainersHere((prev) => [...prev, user]);
            }
        }
    };

    const debounceGetMaintainerOptions = useCallback(
        debounce((val) => getMaintainerOptions(val), 300),
        []
    );

    // 合并当前维护人列表和查到的服务维护人选项，去重
    const options = useMemo(() => {
        const map = new Map<
            number,
            { label: React.ReactNode; value: number }
        >();
        maintainersHere.forEach((maintainer) => {
            map.set(maintainer.id, {
                label: (
                    <Space>
                        {genUserRoleTag(maintainer.role as UserRole)}
                        <span>
                            {maintainer.nickname} ({maintainer.username}) -{" "}
                            {maintainer.email}
                        </span>
                    </Space>
                ),
                value: maintainer.id, // Select.Option的value不能是对象，只能是原始类型
            });
        });
        maintainerOptions.forEach((i) => {
            if (!map.has(i.value.id)) {
                map.set(i.value.id, {
                    label: i.label,
                    value: i.value.id,
                });
            }
        });
        return Array.from(map.values());
    }, [maintainersHere, maintainerOptions]);

    // 切换服务维护人
    const [switchLoading, setSwitchLoading] = useState(false);
    const handleAddOrRemoveServiceMaintainer = async (
        maintainer: UserProfile
    ) => {
        setSwitchLoading(true);
        const isCurrentMaintainer =
            await handleAddOrRemoveServiceMaintainerById(maintainer.id);
        if (isCurrentMaintainer) {
            setMaintainersHere((prev) => [...prev, maintainer]);
        } else {
            setMaintainersHere((prev) =>
                prev.filter((i) => i.id !== maintainer.id)
            );
        }
        setSwitchLoading(false);
    };

    // 服务相关人员按role分类
    const serviceMembersByRole = [personInCharge, ...maintainersHere].reduce(
        (acc, user) => {
            const role = user.role as UserRole;
            if (!acc[role]) {
                acc[role] = [];
            }
            acc[role].push(user);
            return acc;
        },
        {} as Record<UserRole, UserProfile[]>
    );

    // 服务相关人员按role分类展示
    const serviceMembersByRoleContent = (
        <div style={{ padding: "6px 0" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    paddingBottom: 8,
                    borderBottom: "1px solid var(--color-neutral-3)",
                }}
            >
                <Text
                    style={{
                        fontWeight: 600,
                        fontSize: 14,
                        whiteSpace: "nowrap",
                    }}
                >
                    {serviceUuid} 相关人员
                </Text>
                <Text
                    style={{
                        fontSize: 12,
                        marginLeft: 8,
                        whiteSpace: "nowrap",
                    }}
                >
                    {Object.values(serviceMembersByRole).flat().length} 人
                </Text>
            </div>
            <Space direction="vertical" style={{ width: "100%" }}>
                {Object.entries(serviceMembersByRole).map(([role, users]) => (
                    <div
                        key={role}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        {genUserRoleTag(role as UserRole, "small")}
                        {userAvatar(users, 28)}
                    </div>
                ))}
            </Space>
        </div>
    );

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
                <Popover
                    position="bottom"
                    content={serviceMembersByRoleContent}
                    style={{ whiteSpace: "nowrap", maxWidth: "none" }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                        onClick={() => handleViewService(serviceUuid)}
                    >
                        {serviceUuid}
                    </Text>
                </Popover>

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
                                </Space>
                            </Select.Option>
                        ))}
                </Select>
                <span className={styles.userInfo}>
                    <Text className={styles.serviceAvatarTip}>
                        {isLatest ? "服务" : "版本"}负责人
                    </Text>
                    {userAvatar([personInCharge], 32)}
                </span>
                {(maintainersHere.length > 0 || isServiceOwnerOrIsL0) &&
                    isLatest && (
                        <Space size={10}>
                            <span className={styles.userInfo}>
                                <Text className={styles.serviceAvatarTip}>
                                    服务维护者
                                </Text>
                                {userAvatar(maintainersHere, 32, 5)}
                            </span>
                            {isServiceOwnerOrIsL0 && (
                                <Select
                                    mode="multiple"
                                    showSearch
                                    filterOption={false}
                                    onSearch={debounceGetMaintainerOptions}
                                    options={options}
                                    value={maintainersHere.map((m) => m.id)}
                                    placeholder="Search by username, nickname or email"
                                    style={{
                                        width: 200,
                                    }}
                                    triggerProps={{
                                        autoAlignPopupWidth: false,
                                        autoAlignPopupMinWidth: true,
                                        position: "bl",
                                    }}
                                    prefix={
                                        switchLoading ? (
                                            <IconLoading
                                                style={{
                                                    marginLeft: 6,
                                                }}
                                            />
                                        ) : (
                                            <IconUserGroup
                                                style={{
                                                    marginLeft: 6,
                                                }}
                                            />
                                        )
                                    }
                                    renderTag={() => null}
                                    notFoundContent={null}
                                    onChange={(val) => {
                                        if (switchLoading) {
                                            return;
                                        }
                                        const newIds = val as number[];
                                        const currentIds = maintainersHere.map(
                                            (m) => m.id
                                        );
                                        // 找出新增的维护者
                                        const addedId = newIds.find(
                                            (id) => !currentIds.includes(id)
                                        );
                                        // 找出移除的维护者
                                        const removedId = currentIds.find(
                                            (id) => !newIds.includes(id)
                                        );

                                        // 执行添加或移除操作
                                        if (addedId) {
                                            const addedMaintainer =
                                                maintainerOptions.find(
                                                    (i) =>
                                                        i.value.id === addedId
                                                )?.value;
                                            if (addedMaintainer) {
                                                handleAddOrRemoveServiceMaintainer(
                                                    addedMaintainer
                                                );
                                            }
                                        } else if (removedId) {
                                            const removedMaintainer =
                                                maintainersHere.find(
                                                    (i) => i.id === removedId
                                                );
                                            if (removedMaintainer) {
                                                handleAddOrRemoveServiceMaintainer(
                                                    removedMaintainer
                                                );
                                            }
                                        }
                                    }}
                                />
                            )}
                        </Space>
                    )}
            </Space>
        </div>
    );
};

export default Header;
