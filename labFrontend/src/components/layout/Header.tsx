import { useAuth } from '@/context/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-lab-surface/95 backdrop-blur-lg border-b border-lab-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-lab-primary">Lab</span>
          <span className="text-lab-text">oratorio</span>
        </h1>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-xs text-lab-text-muted hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="p-2 text-lab-text-muted hover:text-lab-accent transition-colors"
                title="Cerrar sesion"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
