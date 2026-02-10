import { Router } from 'express';
import {
  createBadge,
  getAllBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
} from '../controllers/badgeController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../config/multer';

const router = Router();

// Authenticated
router.get('/', authenticate, getAllBadges);
router.get('/:id', authenticate, getBadgeById);

// Admin only
router.post('/', authenticate, requireAdmin, upload.single('image'), createBadge);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updateBadge);
router.delete('/:id', authenticate, requireAdmin, deleteBadge);

export default router;
