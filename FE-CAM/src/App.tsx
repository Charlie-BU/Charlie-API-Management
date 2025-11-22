import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "@/router";
import "./App.less";
import { useUser } from "@/hooks/useUser";

const App: React.FC = () => {
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
