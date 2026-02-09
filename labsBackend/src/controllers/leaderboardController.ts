import { Request, Response } from 'express';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response';

export const getLeaderboard = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({ isAdmin: false })
      .select('name username profilePhoto totalPoints')
      .sort({ totalPoints: -1 })
      .limit(50)
      .lean();

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));

    sendSuccess(res, leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    sendError(res, 'Failed to fetch leaderboard', 500);
  }
};
