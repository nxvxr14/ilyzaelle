import { Router } from 'express';
import {
  getCourseProgress,
  completeCard,
  completeModule,
  openRewardBox,
  getUserBadges,
  getAdminStats,
  getUserActivity,
} from '../controllers/progressController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Authenticated
router.get('/course/:courseId', authenticate, getCourseProgress);
router.post('/course/:courseId/module/:moduleId/card/:cardId/complete', authenticate, completeCard);
router.post('/course/:courseId/module/:moduleId/complete', authenticate, completeModule);
router.post('/course/:courseId/module/:moduleId/reward', authenticate, openRewardBox);
router.get('/badges', authenticate, getUserBadges);
router.get('/activity', authenticate, getUserActivity);

// Admin only
router.get('/admin/stats', authenticate, requireAdmin, getAdminStats);

export default router;
