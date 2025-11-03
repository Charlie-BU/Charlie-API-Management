import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as ArcoLayout } from '@cloud-materials/common';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './index.module.css';

const { Content } = ArcoLayout;

const Layout: React.FC = () => {
  return (
    <ArcoLayout className={styles.layout}>
      <Header />
      <ArcoLayout>
        <Sidebar />
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </ArcoLayout>
    </ArcoLayout>
  );
};

export default Layout;