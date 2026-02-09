import { Request, Response, NextFunction } from 'express';
import { sendError } from '../../utils/response';

const VALID_CARD_TYPES = ['text', 'text-input', 'multiple-choice', 'photo-upload'];

export const validateCard = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { moduleId, type, points } = req.body;

  if (!moduleId || typeof moduleId !== 'string') {
    sendError(res, 'Module ID is required');
    return;
  }

  if (!type || !VALID_CARD_TYPES.includes(type)) {
    sendError(res, `Card type must be one of: ${VALID_CARD_TYPES.join(', ')}`);
    return;
  }

  if (points !== undefined && (typeof points !== 'number' || points < 0)) {
    sendError(res, 'Points must be a non-negative number');
    return;
  }

  // Validate options for multiple-choice
  if (type === 'multiple-choice') {
    const { options } = req.body;
    if (!options || !Array.isArray(options) || options.length < 2) {
      sendError(res, 'Multiple choice cards need at least 2 options');
      return;
    }
    const hasCorrect = options.some(
      (opt: { isCorrect?: boolean }) => opt.isCorrect === true
    );
    if (!hasCorrect) {
      sendError(res, 'At least one option must be marked as correct');
      return;
    }
  }

  next();
};
