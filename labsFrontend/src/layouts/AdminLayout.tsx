import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/common/Loading';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLayout = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-dvh bg-pixel-dark flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto md:ml-64">
        <button
          className="md:hidden mb-4 text-pixel-light font-pixel text-xs border border-pixel-primary/30 px-3 py-1 rounded"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
