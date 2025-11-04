import React from "react";
import {
    PageHeader,
    Space,
    Dropdown,
    Menu,
    Avatar,
    IconDown,
    Popover,
    IconLanguage,
} from "@cloud-materials/common";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";
import { Logo } from "@/assets/icons";
import { userPopoverContent } from "./UserPopover";

const Header: React.FC = () => {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.resolvedLanguage;
    const toggleLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    // 模拟用户信息（后续可替换为真实数据）
    const user = {
        username: "Cam.admin",
        nickname: "管理员",
        email: "admin@example.comadmin@example.comadmin@example.comadmin@example.comadmin@example.comadmin@example.com",
        role: "Admin",
        level: "P4",
        avatar: "https://charlie-assets.oss-rg-china-mainland.aliyuncs.com/images/charlie.jpg",
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
            subTitle={
                <div style={{ fontSize: "15px", color: "#999" }}>
                    Clean, Accurate, Maintainable
                </div>
            }
            extra={
                <Space size={"large"}>
                    <Dropdown droplist={languageMenu} position="bottom">
                        <div className={styles["language-button"]}>
                            <Space>
                                <IconLanguage />
                                {currentLanguage === "zh-CN"
                                    ? "中文"
                                    : "English"}
                                <IconDown />
                            </Space>
                        </div>
                    </Dropdown>
                    <Popover position="br" content={userPopoverContent(user)}>
                        <Avatar
                            size={32}
                            style={{ backgroundColor: "#ecf2ff" }}
                        >
                            {user.username[0]}
                        </Avatar>
                    </Popover>
                </Space>
            }
        />
    );
};

export default Header;
