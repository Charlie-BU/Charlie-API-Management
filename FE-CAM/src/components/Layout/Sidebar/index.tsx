import React from "react";
import { Menu } from "@cloud-materials/common";
import { IconHouseDashboard, IconExamineeInformation } from "@cloud-materials/common/ve-o-iconbox";

import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const MenuItem = Menu.Item;

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const tabList = [
        {
            key: "/",
            icon: <IconHouseDashboard style={{ width: 18, height: 18 }} />,
            title: t("nav.home"),
        },
        {
            key: "/api",
            icon: <IconExamineeInformation style={{ width: 18, height: 18 }} />,
            title: t("nav.apiDefinition"),
        },
    ];

    const handleMenuClick = (key: string) => {
        navigate(key);
    };

    const getSelectedKeys = () => {
        const path = location.pathname;
        return [path];
    };

    return (
        <Menu
            selectedKeys={getSelectedKeys()}
            onClickMenuItem={handleMenuClick}
            className={styles.menu}
        >
            {tabList.map((item) => (
                <MenuItem
                    key={item.key}
                    style={{ display: "flex", alignItems: "center" }}
                >
                    {item.icon}
                    {item.title}
                </MenuItem>
            ))}
        </Menu>
    );
};

export default Sidebar;
