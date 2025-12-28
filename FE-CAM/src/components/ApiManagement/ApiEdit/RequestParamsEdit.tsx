import { IconCommon, Space, Typography } from "@cloud-materials/common";
import type { ApiDetail, ApiDraftDetail } from "@/services/api/types";
import ParamTable from "./ParamTable";

const { Text } = Typography;

const RequestParamsEdit = (props: {
    apiDetail: ApiDetail | ApiDraftDetail;
}) => {
    const { apiDetail } = props;
    const requestParamsByLocation = (apiDetail.request_params_by_location ||
        {}) as Record<string, any[]>;

    // We iterate over possible locations or existing ones.
    // To ensure editing works for existing data, we use existLocations.
    // If we want to allow adding to empty locations, we might need a fixed list.
    // But sticking to original logic:
    const existLocations = Object.keys(requestParamsByLocation).filter(
        (location) => requestParamsByLocation[location]?.length > 0
    );

    // If no locations exist (empty API), maybe we should show all standard locations?
    // Or just Query/Body/Path/Header.
    // Let's stick to existLocations for now, but maybe ensure 'query' and 'body' are shown if empty?
    // The user didn't ask to change *which* tables are shown, just the columns.
    // So I will use existLocations.

    // However, if I delete all rows in a table, existLocations logic might hide the table on re-render if it depended on live data.
    // But apiDetail is from props (initialValues). It shouldn't change during editing unless parent re-renders.
    // So it's safe.

    return (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 请求参数
            </div>
            {existLocations.includes("query") && (
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Text>Query 参数</Text>
                    <ParamTable
                        name={["request_params_by_location", "query"]}
                    />
                </Space>
            )}
            {existLocations.includes("path") && (
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Text>Path 参数</Text>
                    <ParamTable name={["request_params_by_location", "path"]} />
                </Space>
            )}
            {existLocations.includes("body") && (
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Text>Body 参数</Text>
                    <ParamTable name={["request_params_by_location", "body"]} />
                </Space>
            )}
            {existLocations.includes("header") && (
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Text>Header 参数</Text>
                    <ParamTable
                        name={["request_params_by_location", "header"]}
                    />
                </Space>
            )}
            {existLocations.includes("cookie") && (
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Text>Cookie 参数</Text>
                    <ParamTable
                        name={["request_params_by_location", "cookie"]}
                    />
                </Space>
            )}
        </Space>
    );
};

export default RequestParamsEdit;
