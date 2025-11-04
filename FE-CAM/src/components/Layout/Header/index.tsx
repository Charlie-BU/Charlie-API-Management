import React from "react";
import {
    PageHeader,
    Space,
    Dropdown,
    Menu,
    Avatar,
    IconDown,
    Popover,
} from "@cloud-materials/common";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";
import { Logo } from "@/assets/icons";

const Header: React.FC = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;
    const toggleLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const languageMenu = (
        <Menu>
            <Menu.Item key="zh-CN" onClick={() => toggleLanguage("zh-CN")}>
                中文
            </Menu.Item>
            <Menu.Item key="en-US" onClick={() => toggleLanguage("en-US")}>
                English
            </Menu.Item>
        </Menu>
    );

    return (
        <PageHeader
            className={styles["custom-header"]}
            title={
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Space size={"medium"}>
                        <Avatar size={30}>
                            <img alt="avatar" src={Logo} />
                        </Avatar>
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            API 管理 CAM
                        </div>
                    </Space>
                </div>
            }
            subTitle="Charlie API Management"
            extra={
                <Space size={"large"}>
                    <Dropdown droplist={languageMenu} position="bottom">
                        <div className={styles["language-button"]}>
                            <Space>
                                {currentLanguage === "zh-CN"
                                    ? "中文"
                                    : "English"}
                                <IconDown />
                            </Space>
                        </div>
                    </Dropdown>
                    <Popover
                        position="br"
                        title="Title"
                        content={
                            <div>
                                <div>User Name</div>
                                <div>user@example.com</div>
                            </div>
                        }
                    >
                        <Avatar size={30}>
                            <img
                                alt="avatar"
                                src="https://charlie-assets.oss-rg-china-mainland.aliyuncs.com/images/charlie.jpg"
                            />
                        </Avatar>
                    </Popover>
                </Space>
            }
        />
    );
};

export default Header;
