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

const RequestParamsEdit: React.FC = () => {
    return (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
                <IconCommon /> 请求参数
            </div>
            
            <Tabs defaultActiveTab="query" type="line">
                <TabPane key="query" title="Query">
                     <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                            <Space>
                                <Button size="small">AI 填充空缺的备注和示例值</Button>
                                <Button size="small">清除本次 AI 填充的数据</Button>
                            </Space>
                        </div>
                        <Form.Item field="requestParams.query" noStyle>
                            <ParamsTable />
                        </Form.Item>
                     </Space>
                </TabPane>
                <TabPane key="path" title="Path">
                     <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item field="requestParams.path" noStyle>
                            <ParamsTable />
                        </Form.Item>
                     </Space>
                </TabPane>
                <TabPane key="body" title="Body">
                     <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item field="requestParams.body" noStyle>
                            <ParamsTable />
                        </Form.Item>
                     </Space>
                </TabPane>
                <TabPane key="header" title="Header">
                     <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item field="requestParams.header" noStyle>
                            <ParamsTable />
                        </Form.Item>
                     </Space>
                </TabPane>
                <TabPane key="cookie" title="Cookie">
                     <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item field="requestParams.cookie" noStyle>
                            <ParamsTable />
                        </Form.Item>
                     </Space>
                </TabPane>
            </Tabs>
        </Space>
    );
};

export default RequestParamsEdit;
