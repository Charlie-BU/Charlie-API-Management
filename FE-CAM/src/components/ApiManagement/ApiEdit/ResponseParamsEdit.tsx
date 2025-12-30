import { useMemo, useState, useRef, useEffect } from "react";
import {
    IconCommon,
    Space,
    Form,
    Tabs,
    Input,
    Message,
    Button,
    IconPlus,
    Popconfirm,
} from "@cloud-materials/common";

import type { ResponseParam, ResponseParamDraft } from "@/services/api/types";
import ParamTable from "./ParamTable";
import { handleConfirm } from "@/utils";

const ResponseParamsEdit = () => {
    const { form } = Form.useFormContext();
    const newStatusCodeRef = useRef("");

    const responseParamsByStatusCode: Record<
        number,
        ResponseParam[] | ResponseParamDraft[]
    > = Form.useWatch("response_params_by_status_code") || {};

    // Sort keys numerically
    const statusCodes: string[] = useMemo(
        () =>
            Object.keys(responseParamsByStatusCode)
                .filter(
                    (status) =>
                        responseParamsByStatusCode[Number(status)]?.length >= 0
                )
                .sort((a, b) => Number(a) - Number(b)),
        [responseParamsByStatusCode]
    );

    const [activeTab, setActiveTab] = useState(statusCodes[0]);
    // useEffect(() => {
    //     if (statusCodes.length > 0) {
    //         setActiveTab(statusCodes[0]);
    //     }
    // }, [statusCodes]);

    const handleDeleteTab = (tab: string) => {
        handleConfirm(
            () => {
                const currentValues =
                    form.getFieldValue("response_params_by_status_code") || {};
                const newValues = { ...currentValues };
                delete newValues[tab];

                form.setFieldValue("response_params_by_status_code", newValues);

                if (activeTab === tab) {
                    const remaining = statusCodes.filter((c) => c !== tab);
                    if (remaining.length > 0) {
                        setActiveTab(remaining[0]);
                    } else {
                        setActiveTab("");
                    }
                }
            },
            "删除状态码",
            "确认删除该状态码及其所有参数配置吗？"
        );
    };

    return (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 响应参数
            </div>
            <Tabs
                type="card"
                editable
                activeTab={activeTab}
                onDeleteTab={handleDeleteTab}
                onChange={setActiveTab}
                addButton={
                    <Popconfirm
                        title="添加状态码"
                        content={
                            <div style={{ marginTop: 10 }}>
                                <Input
                                    placeholder="请输入响应状态码"
                                    onChange={(v) => {
                                        newStatusCodeRef.current = v;
                                    }}
                                />
                            </div>
                        }
                        onOk={() => {
                            const code = newStatusCodeRef.current.trim();
                            if (!code) {
                                Message.warning("状态码不能为空");
                                return Promise.reject();
                            }
                            if (isNaN(Number(code))) {
                                Message.warning("状态码必须为数字");
                                return Promise.reject();
                            }
                            if (statusCodes.includes(code)) {
                                Message.warning("该状态码已存在");
                                return Promise.reject();
                            }
                            const currentValues =
                                form.getFieldValue(
                                    "response_params_by_status_code"
                                ) || {};
                            form.setFieldValue(
                                "response_params_by_status_code",
                                {
                                    ...currentValues,
                                    [code]: [],
                                }
                            );
                            setActiveTab(code);
                        }}
                        onVisibleChange={() => {
                            newStatusCodeRef.current = "";
                        }}
                    >
                        <Button type="text" size="mini" icon={<IconPlus />} />
                    </Popconfirm>
                }
            >
                {statusCodes.map((code) => (
                    <Tabs.TabPane key={code} title={code} />
                ))}
            </Tabs>

            <div>
                {statusCodes.map((code) => (
                    <div
                        key={code}
                        style={{
                            display:
                                activeTab === code.toString()
                                    ? "block"
                                    : "none",
                        }}
                    >
                        <Form.Item
                            field={`response_params_by_status_code.${code}`}
                            triggerPropName="value"
                            noStyle
                        >
                            <ParamTable type="response" />
                        </Form.Item>
                    </div>
                ))}
            </div>
        </Space>
    );
};

export default ResponseParamsEdit;
