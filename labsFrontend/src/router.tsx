import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loading from '@/components/common/Loading';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Lazy-loaded views
const LoginView = lazy(() => import('@/views/auth/LoginView'));
const RegisterView = lazy(() => import('@/views/auth/RegisterView'));
const HomeView = lazy(() => import('@/views/home/HomeView'));
const CategoryView = lazy(() => import('@/views/category/CategoryView'));
const StudyView = lazy(() => import('@/views/study/StudyView'));
const LeaderboardView = lazy(() => import('@/views/leaderboard/LeaderboardView'));
const ProfileView = lazy(() => import('@/views/profile/ProfileView'));
const AdminDashboardView = lazy(() => import('@/views/admin/AdminDashboardView'));
const AdminCategoriesView = lazy(() => import('@/views/admin/AdminCategoriesView'));
const AdminModulesView = lazy(() => import('@/views/admin/AdminModulesView'));
const AdminCardsView = lazy(() => import('@/views/admin/AdminCardsView'));
const AdminUsersView = lazy(() => import('@/views/admin/AdminUsersView'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  // Auth routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <SuspenseWrapper>
            <LoginView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'register',
        element: (
          <SuspenseWrapper>
            <RegisterView />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  // App routes (authenticated)
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomeView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'category/:categoryId',
        element: (
          <SuspenseWrapper>
            <CategoryView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'study/:moduleId',
        element: (
          <SuspenseWrapper>
            <StudyView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'leaderboard',
        element: (
          <SuspenseWrapper>
            <LeaderboardView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <SuspenseWrapper>
            <ProfileView />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  // Admin routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <AdminDashboardView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'categories',
        element: (
          <SuspenseWrapper>
            <AdminCategoriesView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'modules',
        element: (
          <SuspenseWrapper>
            <AdminModulesView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'modules/:moduleId/cards',
        element: (
          <SuspenseWrapper>
            <AdminCardsView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'users',
        element: (
          <SuspenseWrapper>
            <AdminUsersView />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'stats',
        element: (
          <SuspenseWrapper>
            <AdminDashboardView />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);
