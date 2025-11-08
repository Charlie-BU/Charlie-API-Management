import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    GetAllDeletedServicesByUserId,
    GetAllServices,
    GetHisNewestServicesByOwnerId,
    GetMyNewestServices,
} from "@/services/service";
import type {
    DeletedServiceItem,
    ServiceItem,
    ServiceRange,
} from "@/services/service/types";

// 服务列表hook
export const useService = (range: ServiceRange, ownerId?: number) => {
    const navigate = useNavigate();
    const [serviceList, setServiceList] = useState<
        ServiceItem[] | DeletedServiceItem[]
    >([]);
    const [pagination, setPagination] = useState({
        page_size: 10,
        current_page: 1,
        total: 0,
    });
    const [loading, setLoading] = useState(false);

    const fetchMyNewestServices = async () => {
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
        setPagination({
            ...pagination,
            total: res.total || 0,
        });
        setLoading(false);
    };

    const fetchHisNewestServicesByOwnerId = async (ownerId: number) => {
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
        setPagination({
            ...pagination,
            total: res.total || 0,
        });
        setLoading(false);
    };

    const fetchMyDeletedServices = async () => {
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
        setPagination({
            ...pagination,
            total: res.total || 0,
        });
        setLoading(false);
    };

    const fetchAllServices = async () => {
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
        setPagination({
            ...pagination,
            total: res.total || 0,
        });
        setLoading(false);
    };

    // useEffect(() => {
    //     fetchMyNewestServices();
    // }, [pagination.current_page, pagination.page_size]);

    const handlePageChange = (page_size: number, current_page?: number) => {
        setPagination((prev) => {
            const newPagination = {
                ...prev,
                current_page: current_page || prev.current_page,
                page_size: page_size || prev.page_size,
            };
            sessionStorage.setItem("pagination", JSON.stringify(newPagination));
            return newPagination;
        });
    };

    // todo
    const handleViewService = (service_uuid: string) => {
        navigate(`/service/${service_uuid}`);
    };

    return {
        serviceList,
        pagination,
        loading,
        fetchMyNewestServices,
        fetchHisNewestServicesByOwnerId,
        fetchMyDeletedServices,
        fetchAllServices,
        handlePageChange,
        handleViewService,
    };
};

// todo：单一服务hook
export const useThisService = (service_uuid: string) => {
    // const { serviceList } = useService();
    // return serviceList.find((item) => item.service_uuid === service_uuid);
};
