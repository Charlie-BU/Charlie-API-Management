import { IconCommon, Space, Tabs, Form } from "@cloud-materials/common";
import ParamTable from "./ParamTable";
import { tabs } from "./index";

interface RequestParamsEditProps {
    reqParamsActiveTab: string;
    setReqParamsActiveTab: (key: string) => void;
}

const RequestParamsEdit = ({
    reqParamsActiveTab,
    setReqParamsActiveTab,
}: RequestParamsEditProps) => {
    return (
        <Space direction="vertical" size={12}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 请求参数
            </div>
            <Tabs
                activeTab={reqParamsActiveTab}
                onChange={setReqParamsActiveTab}
            >
                {tabs.map((tab) => (
                    <Tabs.TabPane key={tab.key} title={tab.title} />
                ))}
            </Tabs>

            <div>
                {tabs.map((tab) => (
                    <div
                        key={tab.key}
                        style={{
                            display:
                                reqParamsActiveTab === tab.key
                                    ? "block"
                                    : "none",
                        }}
                    >
                        <Form.Item
                            field={`request_params_by_location.${tab.key}`}
                            triggerPropName="value"
                            noStyle
                        >
                            <ParamTable type="request" />
                        </Form.Item>
                    </div>
                ))}
            </div>
        </Space>
    );
};

export default RequestParamsEdit;
