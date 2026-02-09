import { Request, Response, NextFunction } from 'express';
import { sendError } from '../../utils/response';

export const validateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    sendError(res, 'Category name is required (min 2 characters)');
    return;
  }

  next();
};
