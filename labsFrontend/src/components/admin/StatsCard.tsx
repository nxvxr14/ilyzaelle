import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';
import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

const StatsCard = ({ label, value, icon, color }: StatsCardProps) => {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-pixel-dark border-2 border-gray-700 p-4 flex items-center gap-4"
      style={{
        borderLeftColor: color,
        borderLeftWidth: '4px',
      }}
    >
      <div className="text-2xl" style={{ color }}>
        {icon}
      </div>
      <div>
        <p className="font-pixel text-lg" style={{ color }}>
          {value}
        </p>
        <p className="text-gray-400 text-xs font-body">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
