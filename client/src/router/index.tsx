import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CattleListPage } from '../pages/cattle/CattleListPage';
import { AddCattlePage } from '../pages/cattle/AddCattlePage';
import { CattleDetailPage } from '../pages/cattle/CattleDetailPage';
import { ProductionListPage } from '../pages/production/ProductionListPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'cattle',
        element: <CattleListPage />,
      },
      {
        path: 'cattle/add',
        element: <AddCattlePage />,
      },
      {
        path: 'cattle/:id',
        element: <CattleDetailPage />,
      },
      {
        path: 'cattle/:id/edit',
        element: <div>Edit Cattle Page (To be implemented)</div>,
      },
      {
        path: 'production',
        element: <ProductionListPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}