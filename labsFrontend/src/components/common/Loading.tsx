import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 bg-pixel-primary"
            animate={{
              y: [0, -20, 0],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <p className="font-pixel text-[10px] text-gray-400">LOADING...</p>
    </div>
  );
};

export default Loading;
