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
import styles from './index.module.css';

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
      render: (text: string) => (
        <span className={styles.apiName}>{text}</span>
      )
    },
    {
      title: t('api.method'),
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag color={method === 'POST' ? 'orange' : method === 'GET' ? 'blue' : 'gray'}>
          {method}
        </Tag>
      )
    },
    {
      title: t('api.path'),
      dataIndex: 'path',
      key: 'path'
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner'
    },
    {
      title: '项目等级',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color="blue">{status}</Tag>
      )
    },
    {
      title: t('common.createTime'),
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: t('common.updateTime'),
      dataIndex: 'updateTime',
      key: 'updateTime'
    },
    {
      title: t('common.operation'),
      key: 'operation',
      render: () => (
        <Space>
          <Button type="text" size="small">
            {t('common.edit')}
          </Button>
          <Button type="text" size="small" status="danger">
            {t('common.delete')}
          </Button>
        </Space>
      )
    }
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const moreActionsMenu = (
    <Menu>
      <Menu.Item key="export">导出</Menu.Item>
      <Menu.Item key="import">导入</Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title heading={4} className={styles.title}>
          {t('api.title')}
        </Title>
        <Space>
          <Button type="primary">
            {t('api.create')}
          </Button>
          <Dropdown droplist={moreActionsMenu} trigger="click">
            <Button>更多操作</Button>
          </Dropdown>
        </Space>
      </div>
      
      <Card className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchSection}>
            <Search
              placeholder={`${t('common.search')} API`}
              style={{ width: 300 }}
              onSearch={handleSearch}
              value={searchValue}
              onChange={setSearchValue}
            />
          </div>
        </div>
        
        <Divider />
        
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>接口信息</span>
          </div>
          
          <Table
            columns={columns}
            data={mockData}
            pagination={{
              total: mockData.length,
              pageSize: 10,
              current: 1,
              showTotal: true,
              showJumper: true,
              sizeCanChange: true
            }}
            className={styles.table}
          />
        </div>
        
        <div className={styles.parametersSection}>
          <div className={styles.sectionTitle}>请求参数</div>
          <div className={styles.parametersContent}>
            <div className={styles.parameterRow}>
              <div className={styles.parameterName}>Name</div>
              <div className={styles.parameterType}>string</div>
              <div className={styles.parameterRequired}>必填</div>
              <div className={styles.parameterDescription}>
                任务名称，来源于1-200位字符，字符、数字、中英文、下划线，如"1uHe0C-uoFa5o-5e-zA-Z_JI-200$"
              </div>
            </div>
            <div className={styles.parameterRow}>
              <div className={styles.parameterName}>JobType</div>
              <div className={styles.parameterType}>string</div>
              <div className={styles.parameterRequired}>必填</div>
              <div className={styles.parameterDescription}>
                任务类型，Proteus、Bamboo、QuantumChemistry
              </div>
            </div>
            <div className={styles.parameterRow}>
              <div className={styles.parameterName}>BambooConfig</div>
              <div className={styles.parameterType}>object</div>
              <div className={styles.parameterRequired}>选填</div>
              <div className={styles.parameterDescription}>
                Bamboo任务配置，当JobType为Bamboo时必填
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApiManagement;