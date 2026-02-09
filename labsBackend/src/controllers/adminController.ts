import { Request, Response } from 'express';
import User from '../models/User';
import Progress from '../models/Progress';
import Category from '../models/Category';
import Module from '../models/Module';
import Card from '../models/Card';
import { sendSuccess, sendError } from '../utils/response';

export const getDashboardStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalCategories,
      totalModules,
      totalCards,
      totalProgress,
      completedProgress,
    ] = await Promise.all([
      User.countDocuments(),
      Category.countDocuments(),
      Module.countDocuments(),
      Card.countDocuments(),
      Progress.countDocuments(),
      Progress.countDocuments({ completed: true }),
    ]);

    const incompleteProgress = totalProgress - completedProgress;

    sendSuccess(res, {
      totalUsers,
      totalCategories,
      totalModules,
      totalCards,
      totalStarted: totalProgress,
      totalCompleted: completedProgress,
      totalIncomplete: incompleteProgress,
      completionRate:
        totalProgress > 0
          ? Math.round((completedProgress / totalProgress) * 100)
          : 0,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    sendError(res, 'Failed to fetch stats', 500);
  }
};

export const getUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({ isAdmin: false })
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, users);
  } catch (error) {
    console.error('Get users error:', error);
    sendError(res, 'Failed to fetch users', 500);
  }
};

export const getUserProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const progress = await Progress.find({ userId })
      .populate('moduleId')
      .lean();

    sendSuccess(res, progress);
  } catch (error) {
    console.error('Get user progress error:', error);
    sendError(res, 'Failed to fetch user progress', 500);
  }
};

export const getProgressByModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { moduleId } = req.params;

    const progress = await Progress.find({ moduleId })
      .populate('userId', 'name username email')
      .lean();

    const total = progress.length;
    const completed = progress.filter((p) => p.completed).length;
    const incomplete = total - completed;

    sendSuccess(res, {
      moduleId,
      total,
      completed,
      incomplete,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      users: progress,
    });
  } catch (error) {
    console.error('Get progress by module error:', error);
    sendError(res, 'Failed to fetch module progress', 500);
  }
};

export const getProgressByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;

    // Get all modules in this category
    const modules = await Module.find({ categoryId }).select('_id name').lean();
    const moduleIds = modules.map((m) => m._id);

    // Get all progress for those modules
    const progress = await Progress.find({ moduleId: { $in: moduleIds } })
      .populate('userId', 'name username')
      .populate('moduleId', 'name')
      .lean();

    const total = progress.length;
    const completed = progress.filter((p) => p.completed).length;

    sendSuccess(res, {
      categoryId,
      total,
      completed,
      incomplete: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      modules: modules.map((m) => {
        const moduleProgress = progress.filter(
          (p) => p.moduleId && p.moduleId._id.toString() === m._id.toString()
        );
        return {
          ...m,
          totalStarted: moduleProgress.length,
          totalCompleted: moduleProgress.filter((p) => p.completed).length,
        };
      }),
    });
  } catch (error) {
    console.error('Get progress by category error:', error);
    sendError(res, 'Failed to fetch category progress', 500);
  }
};
