import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CModal, Message, Typography, Space } from "@cloud-materials/common";
import { t } from "i18next";

import {
    CreateNewService,
    DeleteServiceById,
    GetAllDeletedServicesByUserId,
    GetAllServices,
    GetAllVersionsByUuid,
    GetHisNewestServicesByOwnerId,
    GetMyNewestServices,
    GetServiceByUuidAndVersion,
    RestoreServiceById,
} from "@/services/service";
import type {
    ApiBrief,
    ApiCategory,
    CreateNewServiceRequest,
    DeletedServiceItem,
    Pagination,
    ServiceDetail,
    ServiceItem,
    ServiceIterationDetail,
} from "@/services/service/types";
import CreateServiceForm from "@/components/ServiceManagement/CreateServiceForm";
import type { UserProfile } from "@/services/user/types";
import { genApiMethodTag } from "@/utils";

const { Text } = Typography;

// 服务列表hook
export const useService = () => {
    const navigate = useNavigate();

    const [serviceList, setServiceList] = useState<
        ServiceItem[] | DeletedServiceItem[]
    >([]);
    const [loading, setLoading] = useState(false);
    // 记录最近一次触发的获取服务操作，用于在删除或还原服务后刷新列表
    const refetchRef = useRef<(() => Promise<number>) | null>(null);

    const fetchMyNewestServices = async (pagination: Pagination) => {
        // 记录最近一次触发的获取服务操作，用于在删除或还原服务后刷新列表
        refetchRef.current = () => fetchMyNewestServices(pagination);

        setLoading(true);
        const res = await GetMyNewestServices(
            pagination.page_size,
            pagination.current_page
        );
        if (res.status !== 200) {
            // 在这里不直接通过Message提示用户的原因是，在组件层一并捕获非200未成功和请求失败错误，一并处理
            setLoading(false);
            setServiceList([]);
            throw new Error(res.message || "获取服务失败");
        }
        setServiceList(res.services || []);
        setLoading(false);
        // 返回服务总数，用于分页
        return res.total || 0;
    };

    const fetchHisNewestServicesByOwnerId = async (
        ownerId: number,
        pagination: Pagination
    ) => {
        // 记录最近一次触发的获取服务操作，用于在删除或还原服务后刷新列表
        refetchRef.current = () =>
            fetchHisNewestServicesByOwnerId(ownerId, pagination);

        setLoading(true);
        const res = await GetHisNewestServicesByOwnerId(
            ownerId,
            pagination.page_size,
            pagination.current_page
        );
        if (res.status !== 200) {
            setLoading(false);
            setServiceList([]);
            throw new Error(res.message || "获取服务失败");
        }
        setServiceList(res.services || []);
        setLoading(false);
        return res.total || 0;
    };

    const fetchMyDeletedServices = async (pagination: Pagination) => {
        // 记录最近一次触发的获取服务操作，用于在删除或还原服务后刷新列表
        refetchRef.current = () => fetchMyDeletedServices(pagination);

        setLoading(true);
        const res = await GetAllDeletedServicesByUserId(
            pagination.page_size,
            pagination.current_page
        );
        if (res.status !== 200) {
            setLoading(false);
            setServiceList([]);
            throw new Error(res.message || "获取服务失败");
        }
        setServiceList(res.deleted_services || []);
        setLoading(false);
        return res.total || 0;
    };

    const fetchAllServices = async (pagination: Pagination) => {
        // 记录最近一次触发的获取服务操作，用于在删除或还原服务后刷新列表
        refetchRef.current = () => fetchAllServices(pagination);

        setLoading(true);
        const res = await GetAllServices(
            pagination.page_size,
            pagination.current_page
        );
        if (res.status !== 200) {
            setLoading(false);
            setServiceList([]);
            throw new Error(res.message || "获取服务失败");
        }
        setServiceList(res.services || []);
        setLoading(false);
        return res.total || 0;
    };

    const createNewService = async (formData: CreateNewServiceRequest) => {
        const res = await CreateNewService(formData);
        if (res.status !== 200) {
            throw new Error(res.message || "创建服务失败");
        }
        return res;
    };

    const handleViewService = (service_uuid: string) => {
        navigate(`/service?uuid=${service_uuid}`);
    };

    const handleDeleteService = async (id: number) => {
        setLoading(true);
        const res = await DeleteServiceById({ id });
        if (res.status !== 200) {
            setLoading(false);
            throw new Error(res.message || "删除服务失败");
        }
        Message.success("删除服务成功");
        // 刷新服务列表
        try {
            await refetchRef.current?.();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            Message.warning(msg || "获取服务失败");
        }
        setLoading(false);
    };

    const handleRestoreService = async (id: number) => {
        setLoading(true);
        const res = await RestoreServiceById({ id });
        if (res.status !== 200) {
            setLoading(false);
            throw new Error(res.message || "还原服务失败");
        }
        Message.success("还原服务成功");
        // 刷新服务列表
        try {
            await refetchRef.current?.();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            Message.warning(msg || "获取服务失败");
        }
        setLoading(false);
    };

    const handleCreateService = (owner?: UserProfile) => {
        const modal = CModal.openArcoForm({
            title: t("service.create"),
            content: <CreateServiceForm owner={owner} />,
            cancelText: t("common.cancel"),
            okText: t("service.submit"),
            onOk: async (values, form) => {
                try {
                    await form.validate();
                    const res = await createNewService({
                        service_uuid: values.service_uuid,
                        description: values.description,
                    });
                    Message.success(res.message || t("service.success"));
                    // 显式关闭弹窗，避免依赖隐式行为
                    modal.close();
                } catch (err: unknown) {
                    const msg =
                        err instanceof Error
                            ? err.message
                            : t("service.failure");
                    Message.error(msg);
                    // 抛出错误以阻止弹窗自动关闭（库内有相关处理）
                    throw err;
                }
            },
        });
    };

    return {
        serviceList,
        loading,
        fetchMyNewestServices,
        fetchHisNewestServicesByOwnerId,
        fetchMyDeletedServices,
        fetchAllServices,
        createNewService,
        handleViewService,
        handleDeleteService,
        handleRestoreService,
        handleCreateService,
    };
};

export const useThisService = (service_uuid: string) => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [versions, setVersions] = useState<
        {
            version: string;
            is_latest: boolean;
        }[]
    >([]);
    const [currentVersion, setCurrentVersion] = useState<string>("");
    const [isLatest, setIsLatest] = useState<boolean>(true);
    const [serviceDetail, setServiceDetail] = useState<
        ServiceDetail | ServiceIterationDetail
    >({} as ServiceDetail);
    const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
    const [apis, setApis] = useState<ApiBrief[]>([]);

    const initHook = async () => {
        setLoading(true);
        try {
            const res = await GetAllVersionsByUuid(service_uuid);
            if (res.status !== 200) {
                setLoading(false);
                setVersions([]);
                throw new Error(res.message || "获取版本失败");
            }
            setVersions(res.versions || []);
            setCurrentVersion(res.versions?.[0]?.version || "");
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : t("service.failure");
            Message.warning(msg || "获取版本失败");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    const fetchServiceDetail = async (version: string) => {
        setLoading(true);
        const res = await GetServiceByUuidAndVersion(service_uuid, version);
        if (res.status !== 200) {
            setServiceDetail({} as ServiceDetail);
            Message.warning(res.message || "获取服务详情失败");
            setLoading(false);
            return;
        }
        setServiceDetail(res.service || {});
        setIsLatest(res.is_latest || true);
        if ("api_categories" in res.service) {
            setApiCategories(res.service.api_categories || []);
        }
        if ("apis" in res.service || "api_drafts" in res.service) {
            setApis(
                ("apis" in res.service
                    ? res.service.apis
                    : "api_drafts" in res.service
                    ? res.service.api_drafts
                    : []) || []
            );
        }
        setLoading(false);
    };

    useEffect(() => {
        initHook();
    }, [service_uuid]);

    useEffect(() => {
        if (currentVersion) {
            fetchServiceDetail(currentVersion);
        }
    }, [currentVersion]);

    const genTreeData = () => {
        if (!apiCategories || !apis) {
            return [];
        }
        const categoryMap = new Map<number, any>();
        apiCategories.forEach((cat) => {
            categoryMap.set(cat.id, {
                key: `category-${cat.id}`,
                title: <Text>{cat.name}</Text>,
                children: [],
                disabled: true,
            });
        });

        const uncategorized: any[] = [];

        apis.forEach((api) => {
            const node = {
                key: api.id.toString(),
                title: (
                    <Space align="center">
                        {genApiMethodTag(api.method)}
                        {api.path}
                    </Space>
                ),
            };
            if (api.category_id == null) {
                uncategorized.push(node);
            } else {
                const group = categoryMap.get(api.category_id);
                if (group) {
                    group.children.push(node);
                } else {
                    uncategorized.push(node);
                }
            }
        });

        const treeData = [
            ...Array.from(categoryMap.values()),
            ...uncategorized,
        ];
        return treeData;
    };

    return {
        loading,
        versions,
        currentVersion,
        isLatest,
        serviceDetail,
        apiCategories,
        apis,
        treeData: genTreeData(),
        setCurrentVersion,
    };
};
