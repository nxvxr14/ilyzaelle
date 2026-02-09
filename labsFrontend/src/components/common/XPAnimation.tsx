import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPAnimationProps {
  points: number;
  onComplete?: () => void;
}

const XPAnimation = ({ points, onComplete }: XPAnimationProps) => {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    // Delay before counting starts
    const startDelay = setTimeout(() => {
      setShowStars(true);
    }, 500);

    // Count up animation
    const duration = 2000;
    const steps = 60;
    const increment = points / steps;
    let current = 0;
    let step = 0;

    const countInterval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), points);
      setCurrentPoints(current);

      if (step >= steps) {
        clearInterval(countInterval);
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    }, duration / steps);

    return () => {
      clearTimeout(startDelay);
      clearInterval(countInterval);
    };
  }, [points, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <AnimatePresence>
        {showStars && (
          <>
            {/* Decorative pixel stars */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-pixel-gold"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.cos((i * Math.PI * 2) / 8) * 120,
                  y: Math.sin((i * Math.PI * 2) / 8) * 120,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Points number */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
        className="relative"
      >
        <span className="font-pixel text-4xl md:text-6xl text-pixel-gold pixel-text-shadow">
          +{currentPoints}
        </span>
      </motion.div>

      {/* XP Label */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="font-pixel text-lg text-pixel-primary pixel-text-shadow"
      >
        XP
      </motion.p>
    </div>
  );
};

export default XPAnimation;
