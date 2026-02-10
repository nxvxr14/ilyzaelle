import { Router } from 'express';
import { login, getProfile, updateProfile, getAllUsers, deleteUser } from '../controllers/authController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../config/multer';

const router = Router();

// Public
router.post('/login', login);

// Authenticated
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, upload.single('profileImage'), updateProfile);

// Admin only
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

export default router;
