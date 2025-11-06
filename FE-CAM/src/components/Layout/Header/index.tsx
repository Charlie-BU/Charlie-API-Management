import React from "react";
import { useNavigate } from "react-router-dom";
import {
    PageHeader,
    Space,
    Dropdown,
    Menu,
    Avatar,
    IconDown,
    Popover,
    IconLanguage,
    IconUser,
} from "@cloud-materials/common";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";
import { Logo } from "@/assets/icons";
import { useUser } from "@/hooks/useUser";
import Profile from "@/components/User/Profile";
import Login from "@/components/User/Login";

const Header: React.FC = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    const currentLanguage = i18n.resolvedLanguage;
    const toggleLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const { user, logout } = useUser();

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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={() => navigate("/")}
                >
                    <img
                        alt="avatar"
                        src={Logo}
                        style={{ width: 32, height: 32 }}
                    />
                    <div
                        style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            marginLeft: 12,
                        }}
                    >
                        API 管理 CAM
                    </div>
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
                    <Popover
                        position="br"
                        // popupVisible={(user)}
                        content={
                            user ? (
                                <Profile userInfo={user} logout={logout} />
                            ) : (
                                <Login />
                            )
                        }
                    >
                        {user ? (
                            <Avatar
                                size={32}
                                style={{ backgroundColor: "#ecf2ff" }}
                            >
                                {user.username[0]}
                            </Avatar>
                        ) : (
                            <Avatar
                                size={32}
                                style={{
                                    backgroundColor: "#c9cdd4",
                                    color: "#fff",
                                }}
                            >
                                <IconUser />
                            </Avatar>
                        )}
                    </Popover>
                </Space>
            }
        />
    );
};

export default Header;
