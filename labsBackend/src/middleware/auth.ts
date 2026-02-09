import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string | undefined;

    if (!userId) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    req.userId = user._id.toString();
    req.isAdmin = user.isAdmin;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    sendError(res, 'Authentication failed', 401);
  }
};

export default authMiddleware;
