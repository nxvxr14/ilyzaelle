import { Router } from 'express';
import {
  getProgress,
  startModule,
  submitAnswer,
  advanceCard,
  completeModule,
  getUserModulesProgress,
} from '../controllers/progressController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/all', getUserModulesProgress);
router.get('/:moduleId', getProgress);
router.post('/:moduleId/start', startModule);
router.post('/:moduleId/answer', submitAnswer);
router.post('/:moduleId/advance', advanceCard);
router.post('/:moduleId/complete', completeModule);

export default router;
