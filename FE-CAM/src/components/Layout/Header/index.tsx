import React, { useState } from "react";
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
import { LogoCAM } from "@/assets/icons";
import Profile from "@/components/User/Profile";
import type { UserProfile } from "@/services/user/types";

interface HeaderProps {
    user?: UserProfile | null;
    logout: () => void;
    openLoginModal: () => void;
    openModifyPasswordModal: () => void;
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
    const { user, logout, openLoginModal, openModifyPasswordModal } = props;
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const [showPopover, setShowPopover] = useState(false);

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
                        src={LogoCAM}
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

                    {user ? (
                        <Popover
                            position="br"
                            trigger="click"
                            popupVisible={showPopover}
                            onVisibleChange={(visible) => {
                                setShowPopover(visible);
                            }}
                            content={
                                <Profile
                                    userInfo={user}
                                    logout={logout}
                                    openModifyPasswordModal={openModifyPasswordModal}
                                />
                            }
                        >
                            <Avatar
                                size={32}
                                style={{
                                    backgroundColor: "#ecf2ff",
                                    cursor: "pointer",
                                }}
                            >
                                {user.nickname[0] || user.username[0]}
                            </Avatar>
                        </Popover>
                    ) : (
                        <Avatar
                            size={32}
                            onClick={() => openLoginModal()}
                            style={{
                                backgroundColor: "#c9cdd4",
                                color: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            <IconUser />
                        </Avatar>
                    )}
                </Space>
            }
        />
    );
};

export default Header;
