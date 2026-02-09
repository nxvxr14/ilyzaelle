import api from './axios';
import type { ApiResponse, LeaderboardEntry } from '@/types';

export const getLeaderboard = async (): Promise<ApiResponse<LeaderboardEntry[]>> => {
  const { data } = await api.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard');
  return data;
};
