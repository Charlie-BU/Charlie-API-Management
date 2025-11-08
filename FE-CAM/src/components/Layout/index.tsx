import React from "react";
import { Outlet } from "react-router-dom";
import { Layout as ArcoLayout, Watermark } from "@cloud-materials/common";
import Header from "./Header";
import Sidebar from "./Sidebar";
import styles from "./index.module.less";
import { useUser } from "@/hooks/useUser";

const ArcoHeader = ArcoLayout.Header;
const ArcoSider = ArcoLayout.Sider;
const ArcoContent = ArcoLayout.Content;

const Layout: React.FC = () => {
    const { user, logout, openLoginModal, openModifyPasswordModal } = useUser();
    return (
        <ArcoLayout className={styles.layout}>
            <ArcoHeader>
                <Header
                    user={user}
                    logout={logout}
                    openLoginModal={openLoginModal}
                    openModifyPasswordModal={openModifyPasswordModal}
                />
            </ArcoHeader>
            <ArcoLayout>
                <ArcoSider style={{ width: "200px" }}>
                    <Sidebar />
                </ArcoSider>
                <ArcoContent className={styles.content}>
                    <Watermark
                        content={user?.username || "Guest"}
                        fontStyle={{ color: "#9ca2a919" }}
                    >
                        <Outlet />
                    </Watermark>
                </ArcoContent>
            </ArcoLayout>
        </ArcoLayout>
    );
};

export default Layout;
