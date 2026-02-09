import { Request, Response, NextFunction } from 'express';
import { sendError } from '../../utils/response';

export const validateModule = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, categoryId } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    sendError(res, 'Module name is required (min 2 characters)');
    return;
  }

  if (!categoryId || typeof categoryId !== 'string') {
    sendError(res, 'Category ID is required');
    return;
  }

  next();
};
