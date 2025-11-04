import React from "react";
import { Menu } from "@cloud-materials/common";
import { IconHome, IconAPIGatewayP } from "@cloud-materials/common/ve-o-iconbox";

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
            icon: <IconHome style={{ width: 20, height: 20 }} />,
            title: t("nav.home"),
        },
        {
            key: "/api",
            icon: <IconAPIGatewayP style={{ width: 20, height: 20 }} />,
            title: t("nav.apiManagement"),
        },
    ];

    const handleMenuClick = (key: string) => {
        navigate(key);
    };

    const getSelectedKeys = () => {
        const path = location.pathname;
        if (path.startsWith("/api")) return ["/api"];
        return ["/"];
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
