import { useState } from "react";
import { IconCommon, Space, Tabs, Form } from "@cloud-materials/common";
import ParamTable from "./ParamTable";

const RequestParamsEdit = () => {
    const [activeTab, setActiveTab] = useState("query");

    const tabs = [
        { key: "query", title: "Query 参数" },
        { key: "path", title: "Path 参数" },
        { key: "body", title: "Body 参数" },
        { key: "header", title: "Header 参数" },
        { key: "cookie", title: "Cookie 参数" },
    ];

    return (
        <Space direction="vertical" size={12}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 请求参数
            </div>
            <Tabs activeTab={activeTab} onChange={setActiveTab}>
                {tabs.map((tab) => (
                    <Tabs.TabPane key={tab.key} title={tab.title} />
                ))}
            </Tabs>

            <div>
                {tabs.map((tab) => (
                    <div
                        key={tab.key}
                        style={{
                            display: activeTab === tab.key ? "block" : "none",
                        }}
                    >
                        <Form.Item
                            field={`request_params_by_location.${tab.key}`}
                            triggerPropName="value"
                            noStyle
                        >
                            <ParamTable />
                        </Form.Item>
                    </div>
                ))}
            </div>
        </Space>
    );
};

export default RequestParamsEdit;
