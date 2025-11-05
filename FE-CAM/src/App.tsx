import React, { useEffect } from "react";
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import Layout from "@/components/Layout";
import ApiManagement from "@/components/ApiManagement";
import "./App.less";
import { useUser } from "@/hooks/useUser";

// 创建路由配置
const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Navigate to="/" replace />,
            },
            {
                path: "api",
                element: <ApiManagement />,
            },
        ],
    },
]);

const App: React.FC = () => {
    // 拉取用户信息
    const { user, fetchUser } = useUser();

    useEffect(() => {
        const token = localStorage.getItem("cam_access_token");
        if (token && !user) {
            fetchUser();
        }
    }, [fetchUser, user]);

    return <RouterProvider router={router} />;
};

export default App;
