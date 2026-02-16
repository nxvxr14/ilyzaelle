import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Progress } from '../models/Progress';
import { Card } from '../models/Card';
import { config } from '../config/constants';
import { AuthRequest } from '../middleware/auth';
import { processProfileImage, deleteImage } from '../utils/imageProcessing';

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '30d' });
};

const userResponse = (user: any) => ({
  _id: user._id,
  email: user.email,
  name: user.name,
  username: user.username || '',
  slogan: user.slogan || '',
  profileImage: user.profileImage,
  isAdmin: user.isAdmin,
  enrolledCourses: user.enrolledCourses || [],
  totalPoints: user.totalPoints,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// POST /auth/check-email — Step 1: check if email exists
export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Admin email → auto-create if needed, return token immediately
    if (normalizedEmail === config.adminEmail.toLowerCase()) {
      let admin = await User.findOne({ email: normalizedEmail });
      if (!admin) {
        admin = await User.create({
          email: normalizedEmail,
          name: 'Admin',
          isAdmin: true,
        });
      }
      const token = generateToken(admin._id.toString());
      res.json({ exists: true, isAdmin: true, token, user: userResponse(admin) });
      return;
    }

    // Regular user → check existence
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const token = generateToken(user._id.toString());
      res.json({ exists: true, isAdmin: false, token, user: userResponse(user) });
      return;
    }

    // New user → needs registration
    res.json({ exists: false });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /auth/register — Step 2: create new user with full profile
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, username, slogan } = req.body;

    if (!email || !name || !username) {
      res.status(400).json({ error: 'Email, name, and username are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({ error: 'Este correo ya esta registrado' });
      return;
    }

    // Check if username is taken
    const usernameTaken = await User.findOne({ username: username.toLowerCase().trim() });
    if (usernameTaken) {
      res.status(409).json({ error: 'Este usuario ya esta en uso' });
      return;
    }

    // Process avatar if uploaded
    let profileImage = '';
    if (req.file) {
      profileImage = await processProfileImage(req.file.buffer, req.file.originalname);
    }

    const user = await User.create({
      email: normalizedEmail,
      name: name.trim(),
      username: username.toLowerCase().trim(),
      slogan: slogan?.trim() || '',
      profileImage,
      isAdmin: false,
    });

    const token = generateToken(user._id.toString());
    res.status(201).json({ token, user: userResponse(user) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id)
      .populate('enrolledCourses')
      .select('-__v');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, username, slogan } = req.body;
    const updates: Record<string, unknown> = {};

    if (name) updates.name = name;
    if (username !== undefined) updates.username = username.toLowerCase().trim();
    if (slogan !== undefined) updates.slogan = slogan;

    if (req.file) {
      const oldImage = req.user?.profileImage;
      const imagePath = await processProfileImage(req.file.buffer, req.file.originalname);
      updates.profileImage = imagePath;
      if (oldImage) deleteImage(oldImage);
    }

    const user = await User.findByIdAndUpdate(req.user?._id, updates, { new: true })
      .select('-__v');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({ isAdmin: false })
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get all progress records with populated references
    const progressRecords = await Progress.find({ user: user._id })
      .populate('course', 'title coverImage')
      .populate('modulesProgress.module', 'title')
      .populate('modulesProgress.badgeEarned', 'name image rarity')
      .populate('completionBadge', 'name image rarity')
      .sort({ updatedAt: -1 });

    // Collect all card IDs referenced in progress
    const cardIds = new Set<string>();
    for (const p of progressRecords) {
      for (const mp of p.modulesProgress) {
        for (const cp of mp.cardsProgress) {
          cardIds.add(cp.card.toString());
        }
      }
    }

    // Fetch cards to get quiz block details (question text, options, correctIndex)
    const cards = await Card.find({ _id: { $in: [...cardIds] } }).select('title blocks');
    const cardsMap = new Map(cards.map((c) => [c._id.toString(), c]));

    // Compute total time from progress timestamps
    let totalTimeMs = 0;
    const coursesDetail = progressRecords.map((p) => {
      let courseTimeMs = 0;
      const modulesDetail = p.modulesProgress.map((mp) => {
        const cardTimes = mp.cardsProgress
          .filter((cp) => cp.completedAt)
          .map((cp) => new Date(cp.completedAt!).getTime());
        let moduleTimeMs = 0;
        if (cardTimes.length > 0) {
          const earliest = Math.min(...cardTimes);
          const latest = mp.completedAt
            ? new Date(mp.completedAt).getTime()
            : Math.max(...cardTimes);
          moduleTimeMs = latest - earliest;
        }
        courseTimeMs += moduleTimeMs;

        // Enrich card progress with quiz block details
        const enrichedCards = mp.cardsProgress.map((cp) => {
          const card = cardsMap.get(cp.card.toString());
          const quizDetails: Record<string, {
            question: string;
            options: string[];
            selected: number;
            correctIndex: number;
            correct: boolean;
          }> = {};

          // Enrich upload responses with prompt text
          const uploadDetails: Record<string, {
            prompt: string;
            imageUrl: string;
          }> = {};

          if (card && cp.quizAnswers) {
            for (const [blockIdx, selectedOpt] of Object.entries(cp.quizAnswers)) {
              const block = card.blocks[parseInt(blockIdx)];
              if (block && block.type === 'quiz') {
                quizDetails[blockIdx] = {
                  question: (block as any).question,
                  options: (block as any).options,
                  selected: selectedOpt as number,
                  correctIndex: (block as any).correctIndex,
                  correct: cp.quizCorrect?.[blockIdx] ?? false,
                };
              }
            }
          }

          if (card && cp.uploadResponses) {
            for (const [blockIdx, imageUrl] of Object.entries(cp.uploadResponses)) {
              const block = card.blocks[parseInt(blockIdx)];
              if (block && block.type === 'upload') {
                uploadDetails[blockIdx] = {
                  prompt: (block as any).prompt,
                  imageUrl: imageUrl as string,
                };
              }
            }
          }

          return {
            card: cp.card,
            cardTitle: card?.title || '',
            completed: cp.completed,
            completedAt: cp.completedAt,
            quizDetails,
            uploadDetails,
          };
        });

        return {
          module: mp.module,
          completed: mp.completed,
          completedAt: mp.completedAt,
          pointsEarned: mp.pointsEarned,
          badgeEarned: mp.badgeEarned,
          timeMs: moduleTimeMs,
          cardsProgress: enrichedCards,
        };
      });

      totalTimeMs += courseTimeMs;

      return {
        course: p.course,
        completed: p.completed,
        completedAt: p.completedAt,
        totalPoints: p.totalPoints,
        completionBadge: p.completionBadge,
        timeMs: courseTimeMs,
        modulesProgress: modulesDetail,
      };
    });

    res.json({
      user: userResponse(user),
      totalTimeMs,
      courses: coursesDetail,
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deleting admin users
    if (user.isAdmin) {
      res.status(403).json({ error: 'Cannot delete admin users' });
      return;
    }

    if (user.profileImage) {
      deleteImage(user.profileImage);
    }

    // Decrement enrolledCount for each course the user was enrolled in
    if (user.enrolledCourses.length > 0) {
      await Course.updateMany(
        { _id: { $in: user.enrolledCourses } },
        { $inc: { enrolledCount: -1 } },
      );
    }

    // Delete all progress records for this user
    await Progress.deleteMany({ user: user._id });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
