import {
    Avatar,
    Descriptions,
    IconCommon,
    Popover,
    Space,
} from "@cloud-materials/common";

import type { ApiDetail, ApiDraftDetail, ApiLevel } from "@/services/api/types";
import { genApiLevelTag, formatDateOrDateTime } from "@/utils";

const BriefInfo = (props: { apiDetail: ApiDetail | ApiDraftDetail }) => {
    const { apiDetail } = props;
    const apiBriefInfo = [
        {
            label: "接口名称",
            value: apiDetail.name,
        },
        {
            label: "接口 Owner",
            value: (
                <Popover
                    content={`${apiDetail.owner?.nickname} (${apiDetail.owner?.username}) - ${apiDetail.owner?.email}`}
                >
                    <Avatar size={25} style={{ backgroundColor: "#ecf2ff" }}>
                        {apiDetail.owner?.nickname?.[0] ||
                            apiDetail.owner?.username?.[0] ||
                            "-"}
                    </Avatar>
                </Popover>
            ),
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
