import React from "react";
import { Menu, Message } from "@cloud-materials/common";
import { IconHouseDashboard } from "@cloud-materials/common/ve-o-iconbox";

import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";
import { ApiIconCAM } from "@/assets/icons";

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
            key: "/service",
            icon: (
                <img
                    alt="avatar"
                    src={ApiIconCAM}
                    style={{
                        width: 18,
                        height: 18,
                        marginRight: 8,
                        marginLeft: 1,
                    }}
                />
            ),
            title: t("nav.apiDefinition"),
        },
    ];

    const handleMenuClick = (key: string) => {
        // 不支持直接点击service
        if (key === "/service") {
            Message.warning("请通过首页服务列表进入服务详情");
            return;
        }
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
