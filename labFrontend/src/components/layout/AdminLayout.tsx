import { Outlet } from 'react-router-dom';
import Header from './Header';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
