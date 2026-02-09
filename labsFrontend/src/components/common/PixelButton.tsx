import { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface PixelButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'gold' | 'green';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantClasses = {
  primary: 'bg-pixel-primary border-pixel-primary hover:bg-red-700',
  secondary: 'bg-pixel-accent border-pixel-accent hover:bg-pixel-secondary',
  gold: 'bg-pixel-gold border-pixel-gold text-black hover:bg-yellow-600',
  green: 'bg-pixel-green border-pixel-green text-black hover:bg-green-600',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-[8px]',
  md: 'px-5 py-3 text-[10px]',
  lg: 'px-8 py-4 text-xs',
};

const PixelButton = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: PixelButtonProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95, x: 2, y: 2 }}
      className={`
        font-pixel border-2 text-white cursor-pointer
        transition-all duration-150
        shadow-pixel active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? '...' : children}
    </motion.button>
  );
};

export default PixelButton;
