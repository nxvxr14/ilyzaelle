import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useProgress } from '@/hooks/useProgress';
import { useNavigate } from 'react-router-dom';
import CategoryGrid from '@/components/home/CategoryGrid';
import Loading from '@/components/common/Loading';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

const HomeView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categories, isLoading: catLoading } = useCategories();
  const { isLoading: progLoading } = useProgress();

  const isLoading = catLoading || progLoading;

  if (isLoading) return <Loading />;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <motion.div {...fadeInUp} className="mb-8">
        <h1 className="font-pixel text-pixel-primary text-lg md:text-xl mb-2">
          Hola, {user?.name?.split(' ')[0] || 'Estudiante'}!
        </h1>
        <p className="text-pixel-light/60 text-sm">
          Selecciona una categoría para comenzar a aprender
        </p>
      </motion.div>

      <CategoryGrid
        categories={categories}
        onCategoryClick={(id) => navigate(`/category/${id}`)}
      />
    </div>
  );
};

export default HomeView;
