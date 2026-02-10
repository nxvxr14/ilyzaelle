import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/constants';
import { AuthRequest } from '../middleware/auth';
import { processProfileImage, deleteImage } from '../utils/imageProcessing';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-register
      const isAdmin = email.toLowerCase() === config.adminEmail.toLowerCase();
      user = await User.create({
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        isAdmin,
      });
    }

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        isAdmin: user.isAdmin,
        totalPoints: user.totalPoints,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
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
    const { name } = req.body;
    const updates: Record<string, unknown> = {};

    if (name) updates.name = name;

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
    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
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

    if (user.profileImage) {
      deleteImage(user.profileImage);
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
