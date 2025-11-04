import React from 'react';
import { Card, Typography } from '@cloud-materials/common';
import { useTranslation } from 'react-i18next';
import styles from './index.module.less';

const { Title } = Typography;

const JobManagement: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title heading={4} className={styles.title}>
          {t('job.title')}
        </Title>
      </div>
      
      <Card className={styles.card}>
        <div className={styles.content}>
          <p>{t('job.title')} - 开发中...</p>
        </div>
      </Card>
    </div>
  );
};

export default JobManagement;