import {
    Descriptions,
    IconCommon,
    Space,
} from "@cloud-materials/common";

import type { ApiDetail, ApiDraftDetail, ApiLevel } from "@/services/api/types";
import { genApiLevelTag, formatDateOrDateTime, userAvatar } from "@/utils";
import type { UserProfile } from "@/services/user/types";

const BriefInfo = (props: { apiDetail: ApiDetail | ApiDraftDetail }) => {
    const { apiDetail } = props;
    const apiBriefInfo = [
        {
            label: "接口名称",
            value: apiDetail.name,
        },
        {
            label: "接口 Owner",
            value: userAvatar(apiDetail.owner as UserProfile, 25),
        },
        {
            label: "接口等级",
            value: genApiLevelTag(apiDetail.level as ApiLevel, "small"),
        },
        {
            label: "创建时间",
            value: apiDetail.created_at
                ? formatDateOrDateTime(apiDetail.created_at)
                : "-",
        },
        {
            label: "更新时间",
            value: apiDetail.updated_at
                ? formatDateOrDateTime(apiDetail.updated_at)
                : "-",
        },
        {
            label: "接口描述",
            value: apiDetail.description || "-",
        },
    ];

    return (
        <Space direction="vertical" size={12}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 接口信息
            </div>
            <Descriptions
                data={apiBriefInfo}
                layout="inline-vertical"
                style={{ marginBottom: -10 }}
            />
        </Space>
    );
};

export default BriefInfo;
