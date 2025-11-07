import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GetMyNewestServices } from "@/services/service";
import type { ServiceItem } from "@/services/service/types";

export const useService = () => {
    const navigate = useNavigate();
    const [serviceList, setServiceList] = useState<ServiceItem[]>([]);
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
            throw new Error(res.message || "获取服务失败");
        }
        setServiceList(res.services || []);
        setPagination({
            ...pagination,
            total: res.total || 0,
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchMyNewestServices();
    }, [pagination.current_page, pagination.page_size]);

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

    const handleViewService = (service_uuid: string) => {
        navigate(`/service/${service_uuid}`);
    };

    return {
        serviceList,
        pagination,
        loading,
        fetchMyNewestServices,
        handlePageChange,
        handleViewService,
    };
};
