import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    GetAllDeletedServicesByUserId,
    GetAllServices,
    GetHisNewestServicesByOwnerId,
    GetMyNewestServices,
} from "@/services/service";
import type {
    DeletedServiceItem,
    Pagination,
    ServiceItem,
} from "@/services/service/types";

// 服务列表hook
export const useService = () => {
    const navigate = useNavigate();

    const [serviceList, setServiceList] = useState<
        ServiceItem[] | DeletedServiceItem[]
    >([]);

    const [loading, setLoading] = useState(false);

    const fetchMyNewestServices = async (pagination: Pagination) => {
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

    return {
        serviceList,
        loading,
        fetchMyNewestServices,
        fetchHisNewestServicesByOwnerId,
        fetchMyDeletedServices,
        fetchAllServices,
        handleViewService,
    };
};

// todo：单一服务hook
export const useThisService = (service_uuid: string) => {
    // const { serviceList } = useService();
    // return serviceList.find((item) => item.service_uuid === service_uuid);
};
