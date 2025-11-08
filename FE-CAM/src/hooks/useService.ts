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
    ServiceRange,
} from "@/services/service/types";

// 服务列表hook
export const useService = () => {
    const navigate = useNavigate();
    // 需要储存当前范围，用于分页
    const [range, setRange] = useState<ServiceRange>("MyServices");
    const [hisId, setHisId] = useState<number | undefined>(undefined);

    const [serviceList, setServiceList] = useState<
        ServiceItem[] | DeletedServiceItem[]
    >([]);

    const [loading, setLoading] = useState(false);

    const fetchMyNewestServices = async (pagination: Pagination) => {
        setRange("MyServices");
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
        setRange("HisServices");
        setHisId(ownerId);
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
        setRange("MyDeletedServices");
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
        setRange("AllServices");
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

    // useEffect(() => {
    //     fetchMyNewestServices();
    // }, [pagination.current_page, pagination.page_size]);

    // const handlePageChange = (page_size: number, current_page?: number) => {
    //     setPagination((prev) => {
    //         const newPagination = {
    //             ...prev,
    //             current_page: current_page || prev.current_page,
    //             page_size: page_size || prev.page_size,
    //         };
    //         sessionStorage.setItem("pagination", JSON.stringify(newPagination));
    //         return newPagination;
    //     });
    //     setTimeout(() => {
    //         console.log(range, hisId, pagination);
    //         switch (range) {
    //             case "MyServices":
    //                 fetchMyNewestServices();
    //                 break;
    //             case "HisServices":
    //                 fetchHisNewestServicesByOwnerId(hisId || 0);
    //                 break;
    //             case "MyDeletedServices":
    //                 fetchMyDeletedServices();
    //                 break;
    //             case "AllServices":
    //                 fetchAllServices();
    //                 break;
    //         }
    //     }, 1000);
    // };

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
