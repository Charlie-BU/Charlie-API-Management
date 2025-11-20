import React, { useMemo, useState } from "react";
import styles from "./index.module.less";
import { useSearchParams } from "react-router-dom";
import { useThisService } from "@/hooks/useService";
import useApi from "@/hooks/useApi";
import Detail from "./Detail";
import Header from "./Header";
import ApiList from "./ApiList";
import { Spin } from "@cloud-materials/common";

const ApiManagement: React.FC = () => {
    const [searchParams] = useSearchParams();
    const uuid = searchParams.get("uuid") || "";
    const {
        loading,
        versions,
        currentVersion,
        isLatest,
        serviceDetail,
        treeData,
        setCurrentVersion,
    } = useThisService(uuid);

    const serviceUuid = useMemo(() => {
        return "service_uuid" in serviceDetail
            ? serviceDetail.service_uuid
            : serviceDetail?.service?.service_uuid || "";
    }, [serviceDetail]);

    const [selectedApiId, setSelectedApiId] = useState<number>(-1);
    const { loading: apiLoading, apiDetail } = useApi(selectedApiId, isLatest);

    if (
        loading ||
        !versions ||
        !serviceUuid ||
        !treeData ||
        treeData.length === 0
    ) {
        return (
            <div className={styles.loadingCenter}>
                <Spin dot />
            </div>
        );
    }

    return (
        <>
            <Header
                loading={loading}
                serviceUuid={serviceUuid}
                versions={versions}
                currentVersion={currentVersion}
                setCurrentVersion={setCurrentVersion}
            />
            <div className={styles.apiPage}>
                {/* 左侧 API 列表 */}
                <ApiList
                    treeData={treeData}
                    setSelectedApiId={setSelectedApiId}
                />
                {/* 右侧详情 */}
                <Detail loading={apiLoading} apiDetail={apiDetail} />
            </div>
        </>
    );
};

export default ApiManagement;
