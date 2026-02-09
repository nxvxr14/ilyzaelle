import type { LeaderboardEntry } from '@/types';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/utils/animations';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const RANK_COLORS: Record<number, string> = {
  1: '#f5c518',
  2: '#c0c0c0',
  3: '#cd7f32',
};

const LeaderboardList = ({ entries, currentUserId }: LeaderboardListProps) => {
  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-2 w-full"
    >
      {entries.map((entry) => {
        const isMe = entry._id === currentUserId;
        const rankColor = RANK_COLORS[entry.rank] || '#888';

        return (
          <motion.div
            key={entry._id}
            variants={fadeInUp}
            className={`
              flex items-center gap-3 p-3 border-2 bg-pixel-dark
              ${isMe ? 'border-pixel-primary' : 'border-gray-700'}
            `}
          >
            <div
              className="w-8 h-8 flex items-center justify-center font-pixel text-sm flex-shrink-0"
              style={{ color: rankColor }}
            >
              {entry.rank <= 3 ? (
                <span className="text-lg">{entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : '🥉'}</span>
              ) : (
                entry.rank
              )}
            </div>

            <div className="w-8 h-8 bg-gray-700 overflow-hidden flex-shrink-0">
              {entry.profilePhoto ? (
                <img
                  src={`${apiBase}${entry.profilePhoto}`}
                  alt={entry.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 font-pixel text-[8px]">
                  {entry.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-body truncate ${isMe ? 'text-pixel-primary' : 'text-white'}`}>
                {entry.name}
                {isMe && <span className="text-[10px] ml-1">(tú)</span>}
              </p>
              <p className="text-gray-500 text-xs">@{entry.username}</p>
            </div>

            <div className="font-pixel text-sm text-pixel-gold flex-shrink-0 pixel-text-shadow">
              {entry.totalPoints}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default LeaderboardList;
