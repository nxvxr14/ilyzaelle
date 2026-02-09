import { useParams } from 'react-router-dom';
import { useModules } from '@/hooks/useModules';
import { useProgress } from '@/hooks/useProgress';
import ModuleList from '@/components/module/ModuleList';
import Loading from '@/components/common/Loading';
import PixelButton from '@/components/common/PixelButton';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

const CategoryView = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { modules, isLoading: modLoading } = useModules(categoryId || '');
  const { progressMap, isLoading: progLoading } = useProgress();

  const isLoading = modLoading || progLoading;

  if (isLoading) return <Loading />;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <motion.div {...fadeInUp} className="mb-6">
        <PixelButton
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
        >
          <FaArrowLeft className="mr-2" /> Volver
        </PixelButton>
      </motion.div>

      <ModuleList
        modules={modules}
        progressMap={progressMap}
        totalCardsMap={{}}
        onModuleClick={(id) => navigate(`/study/${id}`)}
      />
    </div>
  );
};

export default CategoryView;
