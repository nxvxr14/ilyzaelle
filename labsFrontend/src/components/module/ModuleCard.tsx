import { motion } from 'framer-motion';
import type { Module as ModuleType } from '@/types';
import { fadeInUp } from '@/utils/animations';
import ProgressBar from '@/components/common/ProgressBar';

interface ModuleCardProps {
  module: ModuleType;
  index: number;
  progress?: number;
  completed?: boolean;
  onClick: () => void;
}

const ModuleCard = ({ module, index, progress = 0, completed, onClick }: ModuleCardProps) => {
  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        cursor-pointer bg-pixel-dark border-2 p-4 flex items-center gap-4
        transition-colors
        ${completed ? 'border-pixel-green' : 'border-gray-700 hover:border-pixel-primary'}
      `}
      style={{
        boxShadow: completed
          ? '4px 4px 0px 0px rgba(0,212,116,0.3)'
          : '4px 4px 0px 0px rgba(0,0,0,0.6)',
      }}
    >
      {/* Module number */}
      <div className={`
        w-10 h-10 flex items-center justify-center border-2 flex-shrink-0
        font-pixel text-sm
        ${completed ? 'border-pixel-green text-pixel-green bg-pixel-green/10' : 'border-gray-600 text-gray-400'}
      `}>
        {completed ? '✓' : index + 1}
      </div>

      {/* Module info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-pixel text-[10px] text-white truncate">
          {module.name}
        </h4>
        {module.description && (
          <p className="text-gray-400 text-xs font-body mt-1 line-clamp-1">
            {module.description}
          </p>
        )}
        {progress > 0 && !completed && (
          <div className="mt-2">
            <ProgressBar progress={progress} height="sm" showLabel={false} />
          </div>
        )}
      </div>

      {/* Module image */}
      {module.image && (
        <img
          src={`${apiBase}${module.image}`}
          alt={module.name}
          className="w-12 h-12 object-cover pixel-render flex-shrink-0"
        />
      )}
    </motion.div>
  );
};

export default ModuleCard;
