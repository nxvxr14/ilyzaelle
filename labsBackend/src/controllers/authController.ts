import { Request, Response } from 'express';
import User from '../models/User';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // User not found — frontend should redirect to register
      sendSuccess(res, { exists: false, email: normalizedEmail }, 'User not found');
      return;
    }

    // User exists — return user data directly (no password for pilot)
    sendSuccess(res, {
      exists: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        slogan: user.slogan,
        profilePhoto: user.profilePhoto,
        isAdmin: user.isAdmin,
        totalPoints: user.totalPoints,
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Failed to login', 500);
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, username, slogan } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingUser) {
      const field = existingUser.email === normalizedEmail ? 'Email' : 'Username';
      sendError(res, `${field} already taken`);
      return;
    }

    // Check if this should be admin
    const adminEmail = process.env.ADMIN_EMAIL || '';
    const isAdmin = normalizedEmail === adminEmail.toLowerCase();

    const user = await User.create({
      email: normalizedEmail,
      name: name.trim(),
      username: normalizedUsername,
      slogan: slogan?.trim() || '',
      isAdmin,
    });

    sendCreated(res, {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        slogan: user.slogan,
        profilePhoto: user.profilePhoto,
        isAdmin: user.isAdmin,
        totalPoints: user.totalPoints,
      },
    }, 'Registration successful');
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 'Failed to register', 500);
  }
};

export const updateProfilePhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const file = req.file;

    if (!file) {
      sendError(res, 'No image provided');
      return;
    }

    const photoPath = `/api/uploads/${file.filename}`;
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: photoPath },
      { new: true }
    );

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, { profilePhoto: user.profilePhoto }, 'Profile photo updated');
  } catch (error) {
    console.error('Update profile photo error:', error);
    sendError(res, 'Failed to update profile photo', 500);
  }
};
