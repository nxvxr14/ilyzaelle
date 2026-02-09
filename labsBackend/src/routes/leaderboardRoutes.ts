import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboardController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getLeaderboard);

export default router;
