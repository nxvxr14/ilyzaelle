import { motion } from 'framer-motion';
import type { Category } from '@/types';
import { fadeInUp } from '@/utils/animations';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  progress?: number; // 0-100
}

const CATEGORY_COLORS = [
  '#e94560', '#4fc3f7', '#00d474', '#f5c518',
  '#ab47bc', '#ff9800', '#f06292', '#00e5ff',
];

const CategoryCard = ({ category, onClick, progress }: CategoryCardProps) => {
  const colorIndex = category.order % CATEGORY_COLORS.length;
  const color = CATEGORY_COLORS[colorIndex]!;

  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer bg-pixel-dark border-2 p-5 flex flex-col gap-3
                 min-h-[160px] transition-colors"
      style={{
        borderColor: color,
        boxShadow: `4px 4px 0px 0px ${color}60`,
      }}
    >
      {category.image && (
        <img
          src={`${apiBase}${category.image}`}
          alt={category.name}
          className="w-full h-28 object-cover pixel-render"
        />
      )}
      <h3
        className="font-pixel text-sm pixel-text-shadow"
        style={{ color }}
      >
        {category.name}
      </h3>
      {category.description && (
        <p className="text-gray-400 text-sm font-body line-clamp-2">
          {category.description}
        </p>
      )}
      {progress !== undefined && (
        <div className="mt-auto">
          <div className="w-full h-2 bg-gray-800 border border-gray-600">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
          <p className="font-pixel text-[8px] text-gray-400 mt-1">
            {progress}% completado
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryCard;
