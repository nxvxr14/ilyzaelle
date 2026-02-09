import { Response } from 'express';
import Progress from '../models/Progress';
import Card from '../models/Card';
import User from '../models/User';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const getProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const userId = req.userId;

    const progress = await Progress.findOne({ userId, moduleId }).lean();
    sendSuccess(res, progress);
  } catch (error) {
    console.error('Get progress error:', error);
    sendError(res, 'Failed to fetch progress', 500);
  }
};

export const startModule = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const userId = req.userId;

    // Check if progress already exists
    let progress = await Progress.findOne({ userId, moduleId });

    if (progress) {
      sendSuccess(res, progress, 'Progress already exists');
      return;
    }

    progress = await Progress.create({
      userId,
      moduleId,
      currentCardIndex: 0,
      startedAt: new Date(),
    });

    sendSuccess(res, progress, 'Module started');
  } catch (error) {
    console.error('Start module error:', error);
    sendError(res, 'Failed to start module', 500);
  }
};

export const submitAnswer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { cardId, answer } = req.body;
    const userId = req.userId;

    if (!cardId) {
      sendError(res, 'Card ID is required');
      return;
    }

    // Get the card to check answer
    const card = await Card.findById(cardId).lean();
    if (!card) {
      sendError(res, 'Card not found', 404);
      return;
    }

    // Determine if answer is correct and calculate points
    let isCorrect = false;
    let pointsAwarded = 0;

    switch (card.type) {
      case 'text':
        // Text cards are always "correct" — just viewing them
        isCorrect = true;
        pointsAwarded = card.points;
        break;

      case 'text-input':
        isCorrect =
          answer?.trim().toLowerCase() ===
          card.correctAnswer?.trim().toLowerCase();
        pointsAwarded = isCorrect ? card.points : 0;
        break;

      case 'multiple-choice': {
        const correctOption = card.options.find((opt) => opt.isCorrect);
        isCorrect = correctOption?.text === answer;
        pointsAwarded = isCorrect ? card.points : 0;
        break;
      }

      case 'photo-upload':
        // Photo uploads are always "correct" — they submitted a photo
        isCorrect = true;
        pointsAwarded = card.points;
        break;
    }

    // Update progress
    const progress = await Progress.findOneAndUpdate(
      { userId, moduleId },
      {
        $push: {
          answers: {
            cardId,
            answer: answer || '',
            isCorrect,
            pointsAwarded,
          },
        },
        $inc: { pointsEarned: pointsAwarded },
      },
      { new: true }
    );

    if (!progress) {
      sendError(res, 'Progress not found — start the module first', 404);
      return;
    }

    sendSuccess(res, {
      isCorrect,
      pointsAwarded,
      totalPoints: progress.pointsEarned,
      currentCardIndex: progress.currentCardIndex,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    sendError(res, 'Failed to submit answer', 500);
  }
};

export const advanceCard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { cardIndex } = req.body;
    const userId = req.userId;

    const progress = await Progress.findOneAndUpdate(
      { userId, moduleId },
      { currentCardIndex: cardIndex },
      { new: true }
    );

    if (!progress) {
      sendError(res, 'Progress not found', 404);
      return;
    }

    sendSuccess(res, progress, 'Card advanced');
  } catch (error) {
    console.error('Advance card error:', error);
    sendError(res, 'Failed to advance card', 500);
  }
};

export const completeModule = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const userId = req.userId;

    const progress = await Progress.findOneAndUpdate(
      { userId, moduleId },
      {
        completed: true,
        completedAt: new Date(),
      },
      { new: true }
    );

    if (!progress) {
      sendError(res, 'Progress not found', 404);
      return;
    }

    // Add points to user total
    await User.findByIdAndUpdate(userId, {
      $inc: { totalPoints: progress.pointsEarned },
    });

    const timeTaken = progress.completedAt
      ? progress.completedAt.getTime() - progress.startedAt.getTime()
      : 0;

    sendSuccess(res, {
      pointsEarned: progress.pointsEarned,
      timeTakenMs: timeTaken,
      completedAt: progress.completedAt,
    }, 'Module completed!');
  } catch (error) {
    console.error('Complete module error:', error);
    sendError(res, 'Failed to complete module', 500);
  }
};

export const getUserModulesProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    const progress = await Progress.find({ userId })
      .populate('moduleId')
      .lean();

    sendSuccess(res, progress);
  } catch (error) {
    console.error('Get user modules progress error:', error);
    sendError(res, 'Failed to fetch progress', 500);
  }
};
