import { Space, Typography, Divider, Spin } from "@cloud-materials/common";

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

    return (
        <div className={styles.content}>
            <Spin
                size={40}
                loading={
                    loading || !apiDetail || Object.keys(apiDetail).length === 0
                }
            >
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
            </Spin>
        </div>
    );
};

export default Detail;
