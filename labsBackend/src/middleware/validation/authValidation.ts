import { Request, Response, NextFunction } from 'express';
import { sendError } from '../../utils/response';

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    sendError(res, 'Email is required');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    sendError(res, 'Invalid email format');
    return;
  }

  next();
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, name, username } = req.body;

  if (!email || typeof email !== 'string') {
    sendError(res, 'Email is required');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    sendError(res, 'Invalid email format');
    return;
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    sendError(res, 'Name is required (min 2 characters)');
    return;
  }

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    sendError(res, 'Username is required (min 3 characters)');
    return;
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    sendError(res, 'Username can only contain letters, numbers, and underscores');
    return;
  }

  next();
};
