import { motion } from 'framer-motion';
import type { Category } from '@/types';
import CategoryCard from './CategoryCard';
import { staggerContainer } from '@/utils/animations';

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
  progressMap?: Record<string, number>;
}

const CategoryGrid = ({
  categories,
  onCategoryClick,
  progressMap = {},
}: CategoryGridProps) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
    >
      {categories.map((category) => (
        <CategoryCard
          key={category._id}
          category={category}
          onClick={() => onCategoryClick(category._id)}
          progress={progressMap[category._id]}
        />
      ))}
    </motion.div>
  );
};

export default CategoryGrid;
