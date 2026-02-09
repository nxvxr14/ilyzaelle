import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/common/Loading';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-dvh bg-pixel-dark flex flex-col items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
