import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const heightMap = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

const ProgressBar = ({
  progress,
  color = '#e94560',
  showLabel = true,
  height = 'md',
}: ProgressBarProps) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-800 border border-gray-600 ${heightMap[height]} relative overflow-hidden`}>
        <motion.div
          className={`${heightMap[height]} absolute left-0 top-0`}
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {showLabel && height !== 'sm' && (
          <span className="absolute inset-0 flex items-center justify-center font-pixel text-[8px] text-white pixel-text-shadow">
            {clampedProgress}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
