import type { User } from '@/types';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/utils/animations';

interface UserListProps {
  users: User[];
  onUserClick: (userId: string) => void;
}

const UserList = ({ users, onUserClick }: UserListProps) => {
  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-2"
    >
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 text-gray-400 text-xs font-pixel border-b border-gray-700">
        <span></span>
        <span>USUARIO</span>
        <span>EMAIL</span>
        <span>XP</span>
      </div>

      {users.map((user) => (
        <motion.div
          key={user._id}
          variants={fadeInUp}
          onClick={() => onUserClick(user._id)}
          className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-4 py-3
                     bg-pixel-dark border border-gray-700 cursor-pointer
                     hover:border-pixel-primary transition-colors"
        >
          <div className="w-8 h-8 bg-gray-700 overflow-hidden flex-shrink-0">
            {user.profilePhoto ? (
              <img
                src={`${apiBase}${user.profilePhoto}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-pixel text-[8px]">
                {user.name[0]}
              </div>
            )}
          </div>
          <div>
            <p className="text-white text-sm font-body truncate">{user.name}</p>
            <p className="text-gray-500 text-xs">@{user.username}</p>
          </div>
          <p className="text-gray-400 text-xs truncate">{user.email}</p>
          <p className="font-pixel text-[10px] text-pixel-gold">{user.totalPoints}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default UserList;
