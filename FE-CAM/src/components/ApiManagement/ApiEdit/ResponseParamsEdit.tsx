import React from "react";
import {
    Space,
    IconCommon,
    Tabs,
    Button,
    Form
} from "@cloud-materials/common";
import ParamsTable from "./ParamsTable";

const { TabPane } = Tabs;

const ResponseParamsEdit: React.FC = () => {
    return (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 响应参数
            </div>
            
            <Tabs defaultActiveTab="body" type="line">
                <TabPane key="body" title="Body">
                     <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                            <Space>
                                <Button size="small">AI 填充空缺的备注和示例值</Button>
                                <Button size="small">清除本次 AI 填充的数据</Button>
                            </Space>
                        </div>
                        <Form.Item field="responseParams.body" noStyle>
                            <ParamsTable isResponse />
                        </Form.Item>
                     </Space>
                </TabPane>
                <TabPane key="header" title="Header">
                     <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item field="responseParams.header" noStyle>
                            <ParamsTable isResponse />
                        </Form.Item>
                     </Space>
                </TabPane>
            </Tabs>
        </Space>
    );
};

export default ResponseParamsEdit;
