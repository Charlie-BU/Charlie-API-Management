// todo
import {
    IconCommon,
    Space,
    Typography,
    Form,
} from "@cloud-materials/common";

import type {
    ResponseParam,
    ResponseParamDraft,
} from "@/services/api/types";
import { genStatusCodeTag } from "@/utils";
import ParamTable from "./ParamTable";

const { Text } = Typography;

const ResponseParamsEdit = () => {
    const responseParamsByStatusCode: Record<
        number,
        ResponseParam[] | ResponseParamDraft[]
    > = {};
    
    // Sort keys numerically
    const existCodes: number[] = Object.keys(responseParamsByStatusCode)
        .filter(
            (status) => responseParamsByStatusCode[Number(status)]?.length >= 0
        )
        .map(Number)
        .sort((a, b) => a - b);

    return (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 响应参数
            </div>
            {existCodes.map((code) => (
                <Space direction="vertical" size={8} key={code} style={{ width: "100%" }}>
                    <Text>状态码：{genStatusCodeTag(code)}</Text>
                    <Form.Item
                        field={`response_params_by_status_code.${code}`}
                        triggerPropName="value"
                        noStyle
                    >
                        <ParamTable />
                    </Form.Item>
                </Space>
            ))}
        </Space>
    );
};

export default ResponseParamsEdit;
