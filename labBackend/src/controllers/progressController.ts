import { Response } from 'express';
import { Progress } from '../models/Progress';
import { Module } from '../models/Module';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getCourseProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const progress = await Progress.findOne({
      user: req.user?._id,
      course: req.params.courseId,
    })
      .populate('modulesProgress.badgeEarned');

    if (!progress) {
      res.status(404).json({ error: 'Progress not found. Are you enrolled?' });
      return;
    }

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const completeCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId, cardId } = req.params;
    const { quizAnswers } = req.body; // { blockIndex: selectedOption }

    const progress = await Progress.findOne({
      user: req.user?._id,
      course: courseId,
    });

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    const modProgress = progress.modulesProgress.find(
      (mp) => mp.module.toString() === moduleId
    );

    if (!modProgress) {
      res.status(404).json({ error: 'Module progress not found' });
      return;
    }

    // Find or create card progress
    let cardProgress = modProgress.cardsProgress.find(
      (cp) => cp.card.toString() === cardId
    );

    if (!cardProgress) {
      cardProgress = {
        card: cardId as any,
        completed: true,
        quizAnswers: quizAnswers || {},
        quizCorrect: {},
        completedAt: new Date(),
      };
      modProgress.cardsProgress.push(cardProgress);
    } else {
      cardProgress.completed = true;
      cardProgress.completedAt = new Date();
      if (quizAnswers) {
        cardProgress.quizAnswers = quizAnswers;
      }
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Complete card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const completeModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;

    const progress = await Progress.findOne({
      user: req.user?._id,
      course: courseId,
    });

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    const modProgress = progress.modulesProgress.find(
      (mp) => mp.module.toString() === moduleId
    );

    if (!modProgress) {
      res.status(404).json({ error: 'Module progress not found' });
      return;
    }

    if (modProgress.completed) {
      res.status(400).json({ error: 'Module already completed' });
      return;
    }

    const mod = await Module.findById(moduleId);
    if (!mod) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    modProgress.completed = true;
    modProgress.completedAt = new Date();
    modProgress.pointsEarned = mod.points;

    // Reward box logic: roll for badge
    let badgeEarned = null;
    if (mod.badge) {
      const roll = Math.random() * 100;
      if (roll < mod.badgeDropChance) {
        modProgress.badgeEarned = mod.badge;
        badgeEarned = mod.badge;
      }
    }

    // Update total points
    progress.totalPoints = progress.modulesProgress.reduce(
      (sum, mp) => sum + mp.pointsEarned, 0
    );

    // Check if all modules completed
    const allCompleted = progress.modulesProgress.every((mp) => mp.completed);
    if (allCompleted) {
      progress.completed = true;
      progress.completedAt = new Date();

      // Award course completion badge
      const course = await Course.findById(courseId);
      if (course?.completionBadge) {
        progress.completionBadgeEarned = true;
      }
    }

    await progress.save();

    // Update user total points
    const allProgress = await Progress.find({ user: req.user?._id });
    const totalPoints = allProgress.reduce((sum, p) => sum + p.totalPoints, 0);
    await User.findByIdAndUpdate(req.user?._id, { totalPoints });

    res.json({
      progress,
      reward: {
        points: mod.points,
        badgeEarned,
        courseCompleted: allCompleted,
        completionBadge: allCompleted ? (await Course.findById(courseId))?.completionBadge : null,
      },
    });
  } catch (error) {
    console.error('Complete module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const openRewardBox = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;

    const progress = await Progress.findOne({
      user: req.user?._id,
      course: courseId,
    });

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    const modProgress = progress.modulesProgress.find(
      (mp) => mp.module.toString() === moduleId
    );

    if (!modProgress) {
      res.status(404).json({ error: 'Module progress not found' });
      return;
    }

    if (!modProgress.completed) {
      res.status(400).json({ error: 'Module not completed yet' });
      return;
    }

    if (modProgress.rewardBoxOpened) {
      res.status(400).json({ error: 'Reward box already opened' });
      return;
    }

    modProgress.rewardBoxOpened = true;
    await progress.save();

    res.json({
      points: modProgress.pointsEarned,
      badgeEarned: modProgress.badgeEarned,
    });
  } catch (error) {
    console.error('Open reward box error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserBadges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allProgress = await Progress.find({ user: req.user?._id })
      .populate('modulesProgress.badgeEarned')
      .populate('course');

    const badges: unknown[] = [];

    for (const progress of allProgress) {
      for (const mp of progress.modulesProgress) {
        if (mp.badgeEarned) {
          badges.push({
            badge: mp.badgeEarned,
            earnedFrom: progress.course,
            earnedAt: mp.completedAt,
          });
        }
      }

      // Course completion badge
      if (progress.completionBadgeEarned) {
        const course = await Course.findById(progress.course).populate('completionBadge');
        if (course?.completionBadge) {
          badges.push({
            badge: course.completionBadge,
            earnedFrom: course,
            earnedAt: progress.completedAt,
            isCompletionBadge: true,
          });
        }
      }
    }

    res.json(badges);
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalModules = await Module.countDocuments();
    const totalEnrollments = await Progress.countDocuments();
    const completedCourses = await Progress.countDocuments({ completed: true });

    res.json({
      totalUsers,
      totalCourses,
      publishedCourses,
      totalModules,
      totalEnrollments,
      completedCourses,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allProgress = await Progress.find({ user: req.user?._id })
      .populate('course')
      .sort({ updatedAt: -1 });

    res.json(allProgress);
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
