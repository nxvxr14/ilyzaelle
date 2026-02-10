import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
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
