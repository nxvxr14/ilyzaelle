import { Router } from 'express';
import { login, register, updateProfilePhoto } from '../controllers/authController';
import { validateLogin, validateRegister } from '../middleware/validation/authValidation';
import authMiddleware from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.put(
  '/profile-photo',
  authMiddleware,
  upload.single('profilePhoto'),
  updateProfilePhoto
);

export default router;
