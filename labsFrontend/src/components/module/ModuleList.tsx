import { motion } from 'framer-motion';
import type { Module as ModuleType, Progress } from '@/types';
import ModuleCard from './ModuleCard';
import { staggerContainer } from '@/utils/animations';
import { calculateModuleProgress } from '@/utils/points';

interface ModuleListProps {
  modules: ModuleType[];
  progressMap: Record<string, Progress>;
  totalCardsMap: Record<string, number>;
  onModuleClick: (moduleId: string) => void;
}

const ModuleList = ({
  modules,
  progressMap,
  totalCardsMap,
  onModuleClick,
}: ModuleListProps) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3 w-full"
    >
      {modules.map((module, index) => {
        const progress = progressMap[module._id];
        const totalCards = totalCardsMap[module._id] || 0;
        const progressPercent = progress
          ? progress.completed
            ? 100
            : calculateModuleProgress(progress.currentCardIndex, totalCards)
          : 0;

        return (
          <ModuleCard
            key={module._id}
            module={module}
            index={index}
            progress={progressPercent}
            completed={progress?.completed}
            onClick={() => onModuleClick(module._id)}
          />
        );
      })}
    </motion.div>
  );
};

export default ModuleList;
