import { useState } from "react";
import {
    Button,
    Card,
    Space,
    Tag,
    Typography,
    Spin,
    Divider,
    Table,
    IconCommon,
} from "@cloud-materials/common";

import styles from "../index.module.less";
import { genApiMethodTag } from "@/utils";
import type { ApiDetail, ApiDraftDetail } from "@/services/api/types";
import BriefInfo from "./BriefInfo";
import RequestParams from "./RequestParams";
import ResponseParams from "./ResponseParams";

const { Title } = Typography;

const Detail: React.FC<{
    loading: boolean;
    apiDetail: ApiDetail | ApiDraftDetail;
}> = (props) => {
    const { loading, apiDetail } = props;

    if (loading || !apiDetail || Object.keys(apiDetail).length === 0) {
        return (
            <div className={styles.loadingCenter}>
                <Spin dot />
            </div>
        );
    }

    return (
        <div className={styles.content}>
            <div className={styles.header}>
                <Title heading={5} className={styles.pathTitle}>
                    <Space size={10}>
                        {genApiMethodTag(apiDetail?.method, "medium")}
                        {apiDetail.path}
                    </Space>
                </Title>
                <Space>
                    <Button type="secondary">编辑</Button>
                    <Button type="secondary">Mock</Button>
                    <Button type="primary">测试</Button>
                </Space>
            </div>
            <BriefInfo apiDetail={apiDetail} />
            <Divider />
            <RequestParams apiDetail={apiDetail} />
            <Divider />
            <ResponseParams apiDetail={apiDetail} />
        </div>
    );
};

export default Detail;
