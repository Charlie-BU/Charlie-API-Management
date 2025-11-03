import React from 'react';
import { Layout, Button, Space, Dropdown, Menu } from '@cloud-materials/common';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';

const { Header: ArcoHeader } = Layout;

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const languageMenu = (
    <Menu>
      <Menu.Item key="zh-CN" onClick={() => handleLanguageChange('zh-CN')}>
        中文
      </Menu.Item>
      <Menu.Item key="en-US" onClick={() => handleLanguageChange('en-US')}>
        English
      </Menu.Item>
    </Menu>
  );

  return (
    <ArcoHeader className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoText}>API管理平台</span>
      </div>
      <div className={styles.actions}>
        <Space>
          <Dropdown droplist={languageMenu} trigger="click">
            <Button type="text">
              {i18n.language === 'zh-CN' ? '中文' : 'English'}
            </Button>
          </Dropdown>
        </Space>
      </div>
    </ArcoHeader>
  );
};

export default Header;