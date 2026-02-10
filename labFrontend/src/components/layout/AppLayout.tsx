import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 max-w-7xl w-full mx-auto px-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
