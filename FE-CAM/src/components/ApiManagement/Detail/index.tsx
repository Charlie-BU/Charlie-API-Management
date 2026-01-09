import { Space, Typography, Divider, Spin } from "@cloud-materials/common";

import styles from "../index.module.less";
import { genApiMethodTag } from "@/utils";
import type { ApiDetail, ApiDraftDetail } from "@/services/api/types";
import BriefInfo from "./BriefInfo";
import RequestParams from "./RequestParams";
import ResponseParams from "./ResponseParams";
import BlankPage from "../../BlankPage";

const { Title } = Typography;

const Detail: React.FC<{
    loading: boolean;
    apiDetail: ApiDetail | ApiDraftDetail;
}> = (props) => {
    const { loading, apiDetail } = props;

    if (loading) {
        return (
            <div className={styles.loadingCenter}>
                <Spin dot />
            </div>
        );
    }

    if (!apiDetail || Object.keys(apiDetail).length === 0) {
        return <BlankPage message="暂无 API，请发起迭代添加 API" />;
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
