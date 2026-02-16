import { Router } from 'express';
import { checkEmail, register, getProfile, updateProfile, getAllUsers, getUserDetail, deleteUser } from '../controllers/authController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../config/multer';

const router = Router();

// Public
router.post('/check-email', checkEmail);
router.post('/register', upload.single('profileImage'), register);

// Authenticated
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, upload.single('profileImage'), updateProfile);

// Admin only
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.get('/users/:id', authenticate, requireAdmin, getUserDetail);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

export default router;
