import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import ApiManagement from "./components/ApiManagement";
import "./App.less";

// 创建路由配置
const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Navigate to="/api" replace />,
            },
            {
                path: "api",
                element: <ApiManagement />,
            },
        ],
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
