import { useAuth } from '@/context/AuthContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import LeaderboardList from '@/components/leaderboard/LeaderboardList';
import Loading from '@/components/common/Loading';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

const LeaderboardView = () => {
  const { user } = useAuth();
  const { entries, isLoading } = useLeaderboard();

  if (isLoading) return <Loading />;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <motion.div {...fadeInUp} className="mb-6">
        <h1 className="font-pixel text-pixel-gold text-lg md:text-xl mb-2">
          🏆 Ranking
        </h1>
        <p className="text-pixel-light/60 text-sm">
          Los mejores estudiantes de la plataforma
        </p>
      </motion.div>

      <LeaderboardList entries={entries} currentUserId={user?._id} />
    </div>
  );
};

export default LeaderboardView;
