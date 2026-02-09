import type { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'backOut' },
  },
};

export const cardFlip: Variants = {
  enter: {
    rotateX: 90,
    opacity: 0,
    scale: 0.9,
  },
  center: {
    rotateX: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  exit: {
    rotateX: -90,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

export const slideFromRight: Variants = {
  enter: { x: '100%', opacity: 0 },
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const pointsReveal: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: -180 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.5,
    },
  },
};
