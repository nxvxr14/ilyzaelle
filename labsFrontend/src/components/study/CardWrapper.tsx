import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cardFlip } from '@/utils/animations';

interface CardWrapperProps {
  children: ReactNode;
  cardKey: string;
  direction?: 'next' | 'prev';
}

const CardWrapper = ({ children, cardKey }: CardWrapperProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={cardKey}
        variants={cardFlip}
        initial="enter"
        animate="center"
        exit="exit"
        className="study-card"
        style={{ perspective: '1200px' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default CardWrapper;
