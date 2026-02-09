import { useState, useEffect, useCallback } from 'react';
import { getLeaderboard } from '@/api/leaderboardApi';
import type { LeaderboardEntry } from '@/types';

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getLeaderboard();
      if (res.data) {
        setEntries(res.data);
      }
    } catch (e) {
      console.error('Fetch leaderboard error:', e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, isLoading, refetch: fetchLeaderboard };
};
