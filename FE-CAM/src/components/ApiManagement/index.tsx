import React, { useMemo, useState } from "react";
import styles from "./index.module.less";
import { useSearchParams } from "react-router-dom";
import { useServiceIteration, useThisService } from "@/hooks/useService";
import useApi from "@/hooks/useApi";
import Detail from "./Detail";
import Header from "./Header";
import ApiList from "./ApiList";
import ApiEdit from "./ApiEdit";
import { Layout, Message, Spin } from "@cloud-materials/common";

const ApiManagement: React.FC = () => {
    const [searchParams] = useSearchParams();
    const uuid = searchParams.get("uuid") || "";
    const {
        loading,
        versions,
        currentVersion,
        isLatest,
        serviceDetail,
        apiCategories,
        treeData,
        inIteration,
        iterationId,
        setCurrentVersion,
        handleAddCategory,
        handleUpdateApiCategory,
        handleDeleteCategory,
        handleStartIteration,
        handleCompleteIteration,
    } = useThisService(uuid);

    const serviceUuid = useMemo(() => {
        return "service_uuid" in serviceDetail
            ? serviceDetail.service_uuid
            : serviceDetail?.service?.service_uuid || "";
    }, [serviceDetail]);

    // 用于控制当前 API 相关逻辑
    const [selectedApiId, setSelectedApiId] = useState<number>(-1);

    const { loading: apiLoading, apiDetail } = useApi(
        selectedApiId,
        inIteration ? false : isLatest // 如果在迭代中，则 isLatest 为false
    );

    const {
        loading: iterationLoading,
        iterationDetail,
        iterationTreeData,
        handleSaveApiDraft,
    } = useServiceIteration(iterationId, apiCategories);

    const inIterationWarning = () => {
        Message.warning("当前在迭代中，请先完成当前迭代");
    };

    const isLoading =
        loading ||
        !versions ||
        !serviceUuid ||
        !treeData ||
        treeData.length === 0;

    // 单独把loading抽离出来，为了让ApiList中Tree支持autoExpandParent
    // （autoExpandParent 仅在 Tree 第一次挂载的时候生效。如果数据是从远程获取，可以在数据获取完成后，再去渲染 Tree 组件）
    if (isLoading) {
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
                    setCurrentVersion={
                        inIteration && iterationDetail
                            ? inIterationWarning
                            : (v) => {
                                  setSelectedApiId(-1);
                                  setCurrentVersion(v);
                              }
                    }
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
                        isLatest={isLatest}
                        treeData={
                            inIteration && iterationDetail
                                ? iterationTreeData
                                : treeData
                        }
                        setSelectedApiId={(id) => {
                            setSelectedApiId(id);
                        }}
                        handleAddCategory={handleAddCategory}
                        handleUpdateApiCategory={
                            inIteration && iterationDetail
                                ? inIterationWarning
                                : handleUpdateApiCategory
                        }
                        handleDeleteCategory={handleDeleteCategory}
                        handleStartIteration={() => {
                            handleStartIteration();
                        }}
                        handleCompleteIteration={() => {
                            handleCompleteIteration();
                        }}
                    />
                </Layout.Sider>
                <Layout.Content>
                    {inIteration && iterationDetail ? (
                        <ApiEdit
                            loading={iterationLoading || apiLoading}
                            apiDetail={apiDetail}
                            handleSaveApiDraft={handleSaveApiDraft}
                        />
                    ) : (
                        <Detail loading={apiLoading} apiDetail={apiDetail} />
                    )}
                </Layout.Content>
            </Layout>
        </Layout>
    );
};

export default ApiManagement;
