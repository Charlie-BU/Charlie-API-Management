import React, { useMemo, useState } from "react";
import styles from "./index.module.less";
import { useSearchParams } from "react-router-dom";
import { useThisService } from "@/hooks/useService";
import useApi from "@/hooks/useApi";
import Detail from "./Detail";
import Header from "./Header";
import ApiList from "./ApiList";
import ApiEdit from "./ApiEdit";
import { Layout, Spin } from "@cloud-materials/common";

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
        inIteration,
        iterationId,
        setCurrentVersion,
        handleAddCategory,
        handleUpdateApiCategory,
        handleDeleteCategory,
        setInIteration,
        handleStartIteration,
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
        <Layout className={styles.apiPage}>
            <Layout.Header>
                <Header
                    loading={loading}
                    serviceUuid={serviceUuid}
                    versions={versions}
                    currentVersion={currentVersion}
                    setCurrentVersion={(v) => {
                        setSelectedApiId(-1);
                        // todo：中断该操作
                        setInIteration(false);
                        setCurrentVersion(v);
                    }}
                />
            </Layout.Header>

            <Layout>
                {/* 左侧 API 列表 */}
                <Layout.Sider
                    style={{
                        width: 300,
                        paddingBottom: 12,
                    }}
                >
                    <ApiList
                        inIteration={inIteration}
                        treeData={treeData}
                        setSelectedApiId={(id) => {
                            setSelectedApiId(id);
                            // todo
                        }}
                        handleAddCategory={handleAddCategory}
                        handleUpdateApiCategory={handleUpdateApiCategory}
                        handleDeleteCategory={handleDeleteCategory}
                        handleStartIteration={handleStartIteration}
                    />
                </Layout.Sider>
                <Layout.Content>
                    {/* 右侧详情 */}
                    {inIteration && apiDetail ? (
                        <ApiEdit
                            apiDetail={apiDetail}
                            iterationId={iterationId}
                            onSuccess={() => {}}
                        />
                    ) : (
                        <Detail
                            loading={apiLoading}
                            apiDetail={apiDetail}
                        />
                    )}
                </Layout.Content>
            </Layout>
        </Layout>
    );
};

export default ApiManagement;
