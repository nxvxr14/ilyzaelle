import { Response } from 'express';
import { Progress } from '../models/Progress';
import { Module } from '../models/Module';
import { Course } from '../models/Course';
import { Card, IQuizBlock } from '../models/Card';
import { Badge } from '../models/Badge';
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
    const { quizAnswers, uploadResponses } = req.body; // quizAnswers: { blockIndex: selectedOption }, uploadResponses: { blockIndex: imageUrl }

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

    // Evaluate quiz correctness by loading card blocks
    let quizCorrect: Record<string, boolean> = {};
    if (quizAnswers && Object.keys(quizAnswers).length > 0) {
      const card = await Card.findById(cardId);
      if (card) {
        for (const [blockIndex, selectedOption] of Object.entries(quizAnswers)) {
          const block = card.blocks[parseInt(blockIndex, 10)];
          if (block && block.type === 'quiz') {
            const quizBlock = block as IQuizBlock;
            quizCorrect[blockIndex] = Number(selectedOption) === quizBlock.correctIndex;
          }
        }
      }
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
        quizCorrect,
        uploadResponses: uploadResponses || {},
        completedAt: new Date(),
      };
      modProgress.cardsProgress.push(cardProgress);
    } else {
      cardProgress.completed = true;
      cardProgress.completedAt = new Date();
      if (quizAnswers) {
        cardProgress.quizAnswers = quizAnswers;
      }
      cardProgress.quizCorrect = quizCorrect;
      if (uploadResponses) {
        cardProgress.uploadResponses = uploadResponses;
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

    // Calculate quiz bonus: sum points from correctly answered quiz blocks
    let quizBonus = 0;
    const cards = await Card.find({ module: moduleId });
    for (const card of cards) {
      const cp = modProgress.cardsProgress.find(
        (c) => c.card.toString() === card._id.toString()
      );
      if (!cp) continue;
      for (const [blockIndex, isCorrect] of Object.entries(cp.quizCorrect || {})) {
        if (isCorrect) {
          const block = card.blocks[parseInt(blockIndex, 10)];
          if (block && block.type === 'quiz') {
            quizBonus += (block as IQuizBlock).points;
          }
        }
      }
    }

    modProgress.completed = true;
    modProgress.completedAt = new Date();
    modProgress.pointsEarned = mod.points + quizBonus;

    // Badge drop: roll against badgeDropChance, then pick random epic (80%) or legendary (20%)
    let badgeEarned = null;
    const roll = Math.random() * 100;
    if (roll < mod.badgeDropChance) {
      const rarityRoll = Math.random();
      const rarity = rarityRoll < 0.8 ? 'epic' : 'legendary';
      const candidates = await Badge.find({ rarity });
      if (candidates.length > 0) {
        const picked = candidates[Math.floor(Math.random() * candidates.length)]!;
        modProgress.badgeEarned = picked._id as any;
        badgeEarned = picked;
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
    }

    await progress.save();

    // Update user total points
    const allProgress = await Progress.find({ user: req.user?._id });
    const userTotalPoints = allProgress.reduce((sum, p) => sum + p.totalPoints, 0);
    await User.findByIdAndUpdate(req.user?._id, { totalPoints: userTotalPoints });

    res.json({
      progress,
      reward: {
        points: mod.points + quizBonus,
        badgeEarned,
        courseCompleted: allCompleted,
      },
      updatedTotalPoints: userTotalPoints,
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

    // Populate badge document if one was earned
    let populatedBadge = null;
    if (modProgress.badgeEarned) {
      populatedBadge = await Badge.findById(modProgress.badgeEarned);
    }

    res.json({
      points: modProgress.pointsEarned,
      badgeEarned: populatedBadge,
    });
  } catch (error) {
    console.error('Open reward box error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const claimCourseReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const progress = await Progress.findOne({
      user: req.user?._id,
      course: courseId,
    });

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    if (!progress.completed) {
      res.status(400).json({ error: 'Course not completed yet' });
      return;
    }

    if (progress.completionBadgeEarned) {
      res.status(400).json({ error: 'Course reward already claimed' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Award course points
    progress.totalPoints += course.points;
    await progress.save();

    // Update user total points
    const allProgress = await Progress.find({ user: req.user?._id });
    const userTotalPoints = allProgress.reduce((sum, p) => sum + p.totalPoints, 0);
    await User.findByIdAndUpdate(req.user?._id, { totalPoints: userTotalPoints });

    // 100% chance to earn a badge: 80% common, 20% rare
    let badgeEarned = null;
    const rarityRoll = Math.random();
    const rarity = rarityRoll < 0.8 ? 'common' : 'rare';
    const candidates = await Badge.find({ rarity });
    if (candidates.length > 0) {
      const picked = candidates[Math.floor(Math.random() * candidates.length)]!;
      badgeEarned = picked;
      progress.completionBadge = picked._id as any;
    }

    progress.completionBadgeEarned = true;
    await progress.save();

    res.json({
      points: course.points,
      badgeEarned,
      courseCompleted: true,
      updatedTotalPoints: userTotalPoints,
    });
  } catch (error) {
    console.error('Claim course reward error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserBadges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allProgress = await Progress.find({ user: req.user?._id })
      .populate('modulesProgress.badgeEarned')
      .populate('completionBadge')
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
      if (progress.completionBadgeEarned && progress.completionBadge) {
        badges.push({
          badge: progress.completionBadge,
          earnedFrom: progress.course,
          earnedAt: progress.completedAt,
          isCompletionBadge: true,
        });
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
    const totalUsers = await User.countDocuments({ isAdmin: false });
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
