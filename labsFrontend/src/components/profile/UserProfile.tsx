import type { User } from '@/types';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

interface UserProfileProps {
  user: User;
}

const UserProfile = ({ user }: UserProfileProps) => {
  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-4 p-6"
    >
      <div className="w-24 h-24 border-2 border-pixel-primary overflow-hidden bg-pixel-dark">
        {user.profilePhoto ? (
          <img
            src={`${apiBase}${user.profilePhoto}`}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-pixel text-2xl text-gray-500">
            {user.name[0]}
          </div>
        )}
      </div>

      <h2 className="font-pixel text-base text-white pixel-text-shadow">
        {user.name}
      </h2>

      <p className="text-gray-400 text-sm font-body">@{user.username}</p>

      {user.slogan && (
        <p className="text-gray-300 text-sm font-body italic text-center max-w-xs">
          "{user.slogan}"
        </p>
      )}

      <div className="flex items-center gap-2 mt-2">
        <span className="font-pixel text-lg text-pixel-gold pixel-text-shadow">
          {user.totalPoints}
        </span>
        <span className="font-pixel text-[10px] text-gray-400">XP</span>
      </div>
    </motion.div>
  );
};

export default UserProfile;
