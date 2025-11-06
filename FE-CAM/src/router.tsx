import { createBrowserRouter, Navigate, redirect } from "react-router-dom";
import Layout from "@/components/Layout";
import ApiManagement from "@/components/ApiManagement";
import ModifyPassword from "@/components/User/ModifyPassword";
import Register from "@/components/User/Register";
import { Message } from "@cloud-materials/common";
import { t } from "i18next";

const requireAuthLoader = () => {
    const token = localStorage.getItem("cam_access_token");
    if (!token) {
        Message.warning(t("common.loginFirst"));
        return redirect("/");
    }
    return null;
};

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Navigate to="/" replace />,
            },
            {
                path: "user/modify-password",
                element: <ModifyPassword />,
                loader: requireAuthLoader,
            },
            {
                path: "user/register",
                element: <Register />,
            },
            {
                path: "api",
                element: <ApiManagement />,
                loader: requireAuthLoader,
            },
        ],
    },
]);

export default router;
