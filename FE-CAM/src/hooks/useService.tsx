import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CModal,
    Message,
    Typography,
    Space,
    Popover,
} from "@cloud-materials/common";
import { t } from "i18next";

import {
    CommitIteration,
    CreateNewService,
    DeleteServiceById,
    GetAllDeletedServicesByUserId,
    GetAllServices,
    GetAllVersionsByUuid,
    GetHisNewestServicesByOwnerId,
    GetIterationById,
    GetMyNewestServices,
    GetServiceByUuidAndVersion,
    RestoreServiceById,
    StartIteration,
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
import { genApiMethodTag, handleConfirm } from "@/utils";
import AddCategoryForm from "@/components/ApiManagement/ApiList/AddCategoryForm";
import {
    AddCategoryByServiceId,
    DeleteCategoryById,
    UpdateApiCategoryById,
} from "@/services/api";
import CompleteIterationForm from "@/components/ApiManagement/ApiList/CompleteIterationForm";

const { Text } = Typography;

// 服务列表hook
export const useService = () => {
    const navigate = useNavigate();

    const [serviceList, setServiceList] = useState<
        ServiceItem[] | DeletedServiceItem[]
    >([]);
    const [loading, setLoading] = useState(false);
    // 记录最近一次触发的获取服务操作，用于在删除、还原或新增服务后刷新列表
    const refetchRef = useRef<(() => Promise<number>) | null>(null);

    const fetchMyNewestServices = useCallback(
        async (pagination: Pagination) => {
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
        },
        []
    );

    const fetchHisNewestServicesByOwnerId = useCallback(
        async (ownerId: number, pagination: Pagination) => {
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
        },
        []
    );

    const fetchMyDeletedServices = useCallback(
        async (pagination: Pagination) => {
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
        },
        []
    );

    const fetchAllServices = useCallback(async (pagination: Pagination) => {
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
    }, []);

    const createNewService = useCallback(
        async (formData: CreateNewServiceRequest) => {
            const res = await CreateNewService(formData);
            if (res.status !== 200) {
                throw new Error(res.message || "创建服务失败");
            }
            return res;
        },
        []
    );

    const handleViewService = useCallback(
        (service_uuid: string) => {
            navigate(`/service?uuid=${service_uuid}`);
        },
        [navigate]
    );

    const handleDeleteService = useCallback(async (id: number) => {
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
    }, []);

    const handleRestoreService = useCallback(async (id: number) => {
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
    }, []);

    const handleCreateService = useCallback(
        (owner?: UserProfile) => {
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
                        if (res.status !== 200) {
                            throw new Error(res.message || "服务创建失败");
                        }
                        Message.success(res.message || "服务创建成功");
                        // 显式关闭弹窗，避免依赖隐式行为
                        modal.close();
                        // 刷新服务列表
                        try {
                            await refetchRef.current?.();
                        } catch (err) {
                            const msg =
                                err instanceof Error
                                    ? err.message
                                    : "获取服务失败";
                            Message.warning(msg || "获取服务失败");
                        }
                    } catch (err: unknown) {
                        const msg =
                            err instanceof Error ? err.message : "服务创建失败";
                        Message.error(msg);
                        // 抛出错误以阻止弹窗自动关闭（库内有相关处理）
                        throw err;
                    }
                },
            });
        },
        [createNewService]
    );

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

// 某个服务hook
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

    const fetchAllVersions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GetAllVersionsByUuid(service_uuid);
            if (res.status !== 200) {
                setLoading(false);
                setVersions([]);
                throw new Error(res.message || "获取版本失败");
            }
            setVersions(res.versions.filter((v) => v.version) || []); // 筛选掉正在迭代的，没有版本号的service_iteration
            setCurrentVersion(res.versions?.[0]?.version || "");
            setIsLatest(res.versions?.[0]?.is_latest || false);
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : t("service.failure");
            Message.warning(msg || "获取版本失败");
            navigate("/");
        } finally {
            setLoading(false);
        }
    }, [service_uuid, navigate]);

    useEffect(() => {
        fetchAllVersions();
    }, [fetchAllVersions]);

    const fetchServiceDetail = useCallback(
        async (version: string) => {
            setLoading(true);
            const res = await GetServiceByUuidAndVersion(service_uuid, version);
            if (res.status !== 200) {
                setServiceDetail({} as ServiceDetail);
                Message.warning(res.message || "获取服务详情失败");
                setLoading(false);
                return;
            }
            setServiceDetail(res.service || {});
            setIsLatest(res.is_latest);
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
        },
        [service_uuid]
    );

    useEffect(() => {
        if (currentVersion) {
            fetchServiceDetail(currentVersion);
        }
    }, [currentVersion, fetchServiceDetail]);

    const treeData = useMemo(() => {
        if (!apiCategories || !apis) {
            return [] as any[];
        }
        const categoryMap = new Map<number, any>();
        apiCategories.forEach((cat) => {
            categoryMap.set(cat.id, {
                key: `category-${cat.id}`,
                title: (
                    <Popover content={cat.description}>
                        <Text>{cat.name}</Text>
                    </Popover>
                ),
                children: [] as any[],
                selectable: false,
                draggable: false,
            });
        });
        const uncategorizedGroup = {
            key: "category-null",
            title: <Text>未分类</Text>,
            children: [] as any[],
            selectable: false,
            draggable: false,
        };

        apis.forEach((api) => {
            const node = {
                key: api.id.toString(),
                title: (
                    <Space style={{ fontWeight: 500 }}>
                        {genApiMethodTag(api.method, "small")}
                        {api.name}
                        <Text style={{ color: "#6e7687", fontSize: 10 }}>
                            {api.path}
                        </Text>
                    </Space>
                ),
            };
            if (api.category_id == null) {
                uncategorizedGroup.children.push(node);
            } else {
                const group = categoryMap.get(api.category_id);
                if (group) {
                    group.children.push(node);
                } else {
                    uncategorizedGroup.children.push(node);
                }
            }
        });

        return [...Array.from(categoryMap.values()), uncategorizedGroup];
    }, [apiCategories, apis]);

    const handleAddCategory = useCallback(() => {
        const modal = CModal.openArcoForm({
            title: "添加分类",
            content: <AddCategoryForm />,
            cancelText: t("common.cancel"),
            okText: "确定",
            onOk: async (values, form) => {
                try {
                    await form.validate();
                    const res = await AddCategoryByServiceId({
                        service_id: serviceDetail.id,
                        category_name: values.category_name,
                        description: values.description,
                    });
                    if (res.status !== 200) {
                        throw new Error(res.message || "分类添加失败");
                    }
                    Message.success(res.message || "分类添加成功");
                    // 显式关闭弹窗，避免依赖隐式行为
                    modal.close();
                    setApiCategories((prev) => [...prev, res.category || {}]);
                } catch (err: unknown) {
                    const msg =
                        err instanceof Error ? err.message : "分类添加失败";
                    Message.error(msg);
                    // 抛出错误以阻止弹窗自动关闭（库内有相关处理）
                    throw err;
                }
            },
        });
    }, [serviceDetail.id, currentVersion, fetchServiceDetail]);

    const handleUpdateApiCategory = useCallback(
        async (api_id: number, category_id: number) => {
            const res = await UpdateApiCategoryById({ api_id, category_id });
            if (res.status !== 200) {
                throw new Error(res.message || "API 分类更新失败");
            }
            setApis((prev) =>
                prev.map((api) =>
                    api.id === api_id
                        ? {
                              ...api,
                              category_id:
                                  category_id >= 0 ? category_id : null,
                          }
                        : api
                )
            );
        },
        [currentVersion, fetchServiceDetail]
    );

    const handleDeleteCategory = useCallback(
        async (category_id: number) =>
            handleConfirm(
                async () => {
                    try {
                        const res = await DeleteCategoryById({ category_id });
                        if (res.status !== 200) {
                            throw new Error(res.message || "分类删除失败");
                        }
                        Message.success(res.message || "分类删除成功");
                        setApiCategories((prev) =>
                            prev.filter((cat) => cat.id !== category_id)
                        );
                    } catch (err: unknown) {
                        const msg =
                            err instanceof Error ? err.message : "分类删除失败";
                        Message.error(msg);
                    }
                },
                "删除",
                "确认删除当前分类？"
            ),
        [currentVersion, fetchServiceDetail]
    );

    // 迭代相关
    const [inIteration, setInIteration] = useState(false);
    const [iterationId, setIterationId] = useState<number>(-1);

    const handleStartIteration = useCallback(
        async () =>
            handleConfirm(
                async () => {
                    try {
                        const res = await StartIteration({
                            service_id: serviceDetail.id,
                        });
                        if (res.status !== 200 && res.status !== 201) {
                            throw new Error(res.message || "迭代开始失败");
                        }
                        Message.success(res.message || "迭代开始成功");
                        setInIteration(true);
                        setIterationId(res.service_iteration_id);
                    } catch (err: unknown) {
                        const msg =
                            err instanceof Error ? err.message : "迭代开始失败";
                        Message.error(msg);
                    }
                },
                "开始迭代",
                "确认开始新的迭代？"
            ),
        [serviceDetail.id, currentVersion, fetchServiceDetail]
    );

    const handleCompleteIteration = useCallback(async () => {
        const modal = CModal.openArcoForm({
            title: "完成迭代",
            content: <CompleteIterationForm currentVersion={currentVersion} />,
            cancelText: t("common.cancel"),
            okText: "确定",
            onOk: async (values, form) => {
                try {
                    await form.validate();
                    const res = await CommitIteration({
                        service_iteration_id: iterationId,
                        new_version: values.new_version,
                    });
                    if (res.status !== 200) {
                        throw new Error(res.message || "迭代提交失败");
                    }
                    Message.success(res.message || "迭代提交成功");
                    // 显式关闭弹窗，避免依赖隐式行为
                    modal.close();
                } catch (err: unknown) {
                    const msg =
                        err instanceof Error ? err.message : "迭代提交失败";
                    Message.error(msg);
                    // 抛出错误以阻止弹窗自动关闭（库内有相关处理）
                    throw err;
                }
            },
        });
    }, [iterationId, currentVersion, fetchServiceDetail]);

    return {
        loading,
        versions,
        currentVersion,
        isLatest,
        serviceDetail,
        apiCategories,
        apis,
        treeData,
        inIteration,
        iterationId,
        setCurrentVersion,
        handleAddCategory,
        handleUpdateApiCategory,
        handleDeleteCategory,
        setInIteration,
        handleStartIteration,
        handleCompleteIteration,
    };
};

// 迭代相关（只用于一次迭代周期内，与服务历史版本无关）
export const useServiceIteration = (
    iterationId: number,
    apiCategories: ApiCategory[]
) => {
    const [loading, setLoading] = useState(false);
    const [iterationDetail, setIterationDetail] =
        useState<ServiceIterationDetail>({} as ServiceIterationDetail);
    const [apiDrafts, setApiDrafts] = useState<ApiBrief[]>([]);

    const fetchIterationDetail = useCallback(async () => {
        if (iterationId <= 0) return;
        setLoading(true);
        const res = await GetIterationById(iterationId);
        if (res.status !== 200) {
            setIterationDetail({} as ServiceIterationDetail);
            Message.warning(res.message || "获取当前迭代详情失败");
            setLoading(false);
            return;
        }
        setIterationDetail(res.iteration || {});
        if ("api_drafts" in res.iteration) {
            setApiDrafts(res.iteration.api_drafts || [] || []);
        }
        setLoading(false);
    }, [iterationId]);

    useEffect(() => {
        fetchIterationDetail();
    }, [fetchIterationDetail]);

    const iterationTreeData = useMemo(() => {
        if (!apiCategories || !apiDrafts) {
            return [] as any[];
        }
        const categoryMap = new Map<number, any>();
        apiCategories.forEach((cat) => {
            categoryMap.set(cat.id, {
                key: `category-${cat.id}`,
                title: (
                    <Popover content={cat.description}>
                        <Text>{cat.name}</Text>
                    </Popover>
                ),
                children: [] as any[],
                selectable: false,
                draggable: false,
            });
        });
        const uncategorizedGroup = {
            key: "category-null",
            title: <Text>未分类</Text>,
            children: [] as any[],
            selectable: false,
            draggable: false,
        };

        apiDrafts.forEach((apiDraft) => {
            const node = {
                key: apiDraft.id.toString(),
                title: (
                    <Space style={{ fontWeight: 500 }}>
                        {genApiMethodTag(apiDraft.method, "small")}
                        {apiDraft.name}
                        <Text style={{ color: "#6e7687", fontSize: 10 }}>
                            {apiDraft.path}
                        </Text>
                    </Space>
                ),
            };
            if (apiDraft.category_id == null) {
                uncategorizedGroup.children.push(node);
            } else {
                const group = categoryMap.get(apiDraft.category_id);
                if (group) {
                    group.children.push(node);
                } else {
                    uncategorizedGroup.children.push(node);
                }
            }
        });

        return [...Array.from(categoryMap.values()), uncategorizedGroup];
    }, [apiCategories, apiDrafts]);

    return {
        loading,
        iterationDetail,
        apiDrafts,
        iterationTreeData,
        fetchIterationDetail,
    };
};
