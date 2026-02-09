import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/common/Loading';
import Logo from '@/components/common/Logo';
import { FaHome, FaTrophy, FaUser, FaCog } from 'react-icons/fa';

const AppLayout = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navItems = [
    { to: '/', icon: FaHome, label: 'Home' },
    { to: '/leaderboard', icon: FaTrophy, label: 'Ranking' },
    { to: '/profile', icon: FaUser, label: 'Perfil' },
  ];

  return (
    <div className="min-h-dvh bg-pixel-dark flex flex-col">
      {/* Top header - desktop only */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-pixel-darker border-b-2 border-pixel-primary/30">
        <Logo size="sm" />

        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 text-xs font-pixel transition-colors ${
                  isActive
                    ? 'text-pixel-primary'
                    : 'text-pixel-light/60 hover:text-pixel-light'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}

          {user?.isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2 text-xs font-pixel transition-colors ${
                  isActive
                    ? 'text-pixel-gold'
                    : 'text-pixel-light/60 hover:text-pixel-gold/80'
                }`
              }
            >
              <FaCog size={16} />
              Admin
            </NavLink>
          )}

          <button
            onClick={handleLogout}
            className="text-xs font-pixel text-pixel-light/40 hover:text-pixel-danger transition-colors"
          >
            Salir
          </button>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-4">
        <Outlet />
      </main>

      {/* Bottom navigation - mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-pixel-darker border-t-2 border-pixel-primary/30 flex justify-around items-center py-2 px-2 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded transition-colors ${
                isActive
                  ? 'text-pixel-primary'
                  : 'text-pixel-light/50'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[8px] font-pixel">{item.label}</span>
          </NavLink>
        ))}

        {user?.isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded transition-colors ${
                isActive
                  ? 'text-pixel-gold'
                  : 'text-pixel-light/50'
              }`
            }
          >
            <FaCog size={20} />
            <span className="text-[8px] font-pixel">Admin</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
};

export default AppLayout;
