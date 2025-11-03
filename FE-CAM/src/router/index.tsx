import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ApiManagement from '../pages/ApiManagement';
import JobManagement from '../pages/JobManagement';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/api" replace />,
      },
      {
        path: 'api',
        element: <ApiManagement />,
      },
      {
        path: 'job',
        element: <JobManagement />,
      },
    ],
  },
]);

export default router;