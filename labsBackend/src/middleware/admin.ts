import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';

const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.isAdmin) {
    sendError(res, 'Admin access required', 403);
    return;
  }
  next();
};

export default adminMiddleware;
