import { NavLink } from 'react-router-dom';
import {
  IoHome,
  IoPeople,
  IoGrid,
  IoLayers,
  IoDocumentText,
  IoStatsChart,
} from 'react-icons/io5';
import Logo from '@/components/common/Logo';

const links = [
  { to: '/admin', icon: IoHome, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: IoPeople, label: 'Usuarios' },
  { to: '/admin/categories', icon: IoGrid, label: 'Categorias' },
  { to: '/admin/modules', icon: IoLayers, label: 'Modulos' },
  { to: '/admin/stats', icon: IoStatsChart, label: 'Progreso' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-56 bg-pixel-dark border-r-2 border-gray-700
          z-50 transition-transform duration-200 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-gray-700">
          <Logo size="sm" />
          <p className="font-pixel text-[8px] text-pixel-gold mt-1">ADMIN</p>
        </div>

        <nav className="flex-1 p-2 flex flex-col gap-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 text-sm font-body rounded transition-colors ${
                  isActive
                    ? 'bg-pixel-primary/20 text-pixel-primary border-l-2 border-pixel-primary'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon className="text-lg flex-shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-body"
          >
            <IoDocumentText />
            Volver al sitio
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
