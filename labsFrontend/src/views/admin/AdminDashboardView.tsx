import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/api/adminApi';
import StatsCard from '@/components/admin/StatsCard';
import Loading from '@/components/common/Loading';
import type { DashboardStats } from '@/types';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/utils/animations';
import { FaUsers, FaFolder, FaBook, FaLayerGroup } from 'react-icons/fa';

const AdminDashboardView = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardStats();
        if (res.data) setStats(res.data);
      } catch (e) {
        console.error('Dashboard stats error:', e);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) return <Loading />;
  if (!stats) return <p className="text-pixel-light p-4">Error cargando stats</p>;

  return (
    <div>
      <motion.h1 {...fadeInUp} className="font-pixel text-pixel-primary text-lg mb-6">
        Dashboard
      </motion.h1>

      <motion.div
        {...staggerContainer}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatsCard label="Usuarios" value={stats.totalUsers} color="primary" icon={<FaUsers />} />
        <StatsCard label="Categorías" value={stats.totalCategories} color="secondary" icon={<FaFolder />} />
        <StatsCard label="Módulos" value={stats.totalModules} color="gold" icon={<FaBook />} />
        <StatsCard label="Cards" value={stats.totalCards} color="green" icon={<FaLayerGroup />} />
      </motion.div>
    </div>
  );
};

export default AdminDashboardView;
