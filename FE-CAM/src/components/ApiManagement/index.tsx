import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Dropdown, 
  Menu,
  Typography,
  Divider
} from '@cloud-materials/common';
import { useTranslation } from 'react-i18next';
import styles from './index.module.less';

const { Title } = Typography;
const { Search } = Input;

interface ApiItem {
  id: string;
  name: string;
  method: string;
  path: string;
  owner: string;
  status: string;
  createTime: string;
  updateTime: string;
}

const ApiManagement: React.FC = () => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');

  // 模拟API数据
  const mockData: ApiItem[] = [
    {
      id: '1',
      name: 'CreateJob',
      method: 'POST',
      path: '/v1/open/CreateJob',
      owner: '管理员',
      status: 'P4',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-15 10:30:00'
    }
  ];

  const columns = [
    {
      title: t('api.name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: t('api.method'),
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (method: string) => {
        const color = method === 'GET' ? 'blue' : method === 'POST' ? 'green' : 'orange';
        return <Tag color={color}>{method}</Tag>;
      },
    },
    {
      title: t('api.path'),
      dataIndex: 'path',
      key: 'path',
      width: 200,
    },
    {
      title: t('api.owner'),
      dataIndex: 'owner',
      key: 'owner',
      width: 120,
    },
    {
      title: t('api.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const color = status === 'P4' ? 'red' : status === 'P3' ? 'orange' : 'green';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: t('api.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: t('api.updateTime'),
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
    },
    {
      title: t('common.action'),
      key: 'action',
      width: 150,
      render: (_: any, record: ApiItem) => {
        const menu = (
          <Menu>
            <Menu.Item key="edit">{t('common.edit')}</Menu.Item>
            <Menu.Item key="delete">{t('common.delete')}</Menu.Item>
            <Menu.Item key="copy">{t('common.copy')}</Menu.Item>
          </Menu>
        );

        return (
          <Space>
            <Button type="text" size="small">
              {t('common.view')}
            </Button>
            <Dropdown droplist={menu} trigger="click">
              <Button type="text" size="small">
                {t('common.more')}
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const filteredData = mockData.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.path.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title heading={4} className={styles.title}>
          {t('api.title')}
        </Title>
        <Space>
          <Search
            placeholder={t('api.searchPlaceholder')}
            value={searchValue}
            onChange={setSearchValue}
            style={{ width: 300 }}
          />
          <Button type="primary">
            {t('api.create')}
          </Button>
        </Space>
      </div>
      
      <Divider />
      
      <Card className={styles.card}>
        <Table
          columns={columns}
          data={filteredData}
          pagination={{
            pageSize: 10,
            total: filteredData.length,
            showTotal: true,
          }}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default ApiManagement;