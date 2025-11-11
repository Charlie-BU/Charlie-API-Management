import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    DeleteServiceById,
    GetAllDeletedServicesByUserId,
    GetAllServices,
    GetHisNewestServicesByOwnerId,
    GetMyNewestServices,
    RestoreServiceById,
} from "@/services/service";
import type {
    DeletedServiceItem,
    Pagination,
    ServiceItem,
} from "@/services/service/types";
import { Message } from "@cloud-materials/common";

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

    // todo
    const handleViewService = (service_uuid: string) => {
        navigate(`/service/${service_uuid}`);
    };

    const handleDeleteService = async (id: number) => {
        setLoading(true);
        const res = await DeleteServiceById({ id });
        if (res.status !== 200) {
            setLoading(false);
            throw new Error(res.message || "删除服务失败");
        }
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
        // 刷新服务列表
        try {
            await refetchRef.current?.();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            Message.warning(msg || "获取服务失败");
        }
        setLoading(false);
    };

    return {
        serviceList,
        loading,
        fetchMyNewestServices,
        fetchHisNewestServicesByOwnerId,
        fetchMyDeletedServices,
        fetchAllServices,
        handleViewService,
        handleDeleteService,
        handleRestoreService,
    };
};

// todo：单一服务hook
export const useThisService = (service_uuid: string) => {
    // const { serviceList } = useService();
    // return serviceList.find((item) => item.service_uuid === service_uuid);
};
