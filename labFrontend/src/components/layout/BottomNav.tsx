import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  AcademicCapIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    {
      to: '/home',
      label: 'Inicio',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      to: '/courses',
      label: 'Cursos',
      icon: AcademicCapIcon,
      activeIcon: AcademicCapIconSolid,
    },
    {
      to: '/profile',
      label: 'Perfil',
      icon: UserCircleIcon,
      activeIcon: UserCircleIconSolid,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-lab-surface/95 backdrop-blur-lg border-t border-lab-border">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive =
            item.to === '/home'
              ? location.pathname === '/home'
              : location.pathname.startsWith(item.to);
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-0"
            >
              <Icon
                className={`w-6 h-6 transition-colors duration-200 ${
                  isActive ? 'text-lab-primary' : 'text-lab-text-muted'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-lab-primary' : 'text-lab-text-muted'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
