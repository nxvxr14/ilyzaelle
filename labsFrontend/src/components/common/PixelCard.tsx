import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PixelCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  glowColor?: string;
}

const PixelCard = ({
  children,
  className = '',
  onClick,
  hoverable = true,
  glowColor,
}: PixelCardProps) => {
  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        bg-pixel-dark border-2 border-gray-700 p-4
        transition-colors duration-200
        shadow-pixel
        ${hoverable ? 'hover:border-pixel-primary cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={glowColor ? { borderColor: glowColor, boxShadow: `4px 4px 0px 0px ${glowColor}40` } : undefined}
    >
      {children}
    </motion.div>
  );
};

export default PixelCard;
