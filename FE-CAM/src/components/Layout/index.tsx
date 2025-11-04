import React from "react";
import { Outlet } from "react-router-dom";
import { Layout as ArcoLayout } from "@cloud-materials/common";
import Header from "./Header";
import Sidebar from "./Sidebar";
import styles from "./index.module.less";

const ArcoHeader = ArcoLayout.Header;
const ArcoSider = ArcoLayout.Sider;
const ArcoContent = ArcoLayout.Content;

const Layout: React.FC = () => {
    return (
        <ArcoLayout className={styles.layout}>
            <ArcoHeader>
                <Header />
            </ArcoHeader>
            <ArcoLayout>
                <ArcoSider style={{ width: "200px" }}>
                    <Sidebar />
                </ArcoSider>
                <ArcoContent className={styles.content}>
                    <Outlet />
                </ArcoContent>
            </ArcoLayout>
        </ArcoLayout>
    );
};

export default Layout;
