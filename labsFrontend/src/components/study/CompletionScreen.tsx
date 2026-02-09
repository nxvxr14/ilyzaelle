import { motion } from 'framer-motion';
import XPAnimation from '@/components/common/XPAnimation';
import PixelButton from '@/components/common/PixelButton';
import { formatTimeDetailed } from '@/utils/time';

interface CompletionScreenProps {
  moduleName: string;
  pointsEarned: number;
  timeTakenMs: number;
  onContinue: () => void;
}

const CompletionScreen = ({
  moduleName,
  pointsEarned,
  timeTakenMs,
  onContinue,
}: CompletionScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-pixel-darker">
      {/* Module name */}
      <motion.h1
        initial={{ opacity: 0, y: -30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="font-pixel text-lg md:text-2xl text-pixel-gold pixel-text-shadow text-center mb-8"
      >
        {moduleName}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-pixel text-sm text-pixel-green pixel-text-shadow mb-12"
      >
        COMPLETADO!
      </motion.p>

      {/* Points animation */}
      <div className="relative mb-12">
        <XPAnimation points={pointsEarned} />
      </div>

      {/* Time taken */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
        className="flex flex-col items-center gap-2 mb-8"
      >
        <p className="font-pixel text-[10px] text-gray-400">TIEMPO</p>
        <p className="font-pixel text-sm text-pixel-blue pixel-text-shadow">
          {formatTimeDetailed(timeTakenMs)}
        </p>
      </motion.div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <PixelButton onClick={onContinue} size="lg" variant="gold">
          CONTINUAR
        </PixelButton>
      </motion.div>
    </div>
  );
};

export default CompletionScreen;
