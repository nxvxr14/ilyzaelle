import { Router } from 'express';
import { getCardsByModule, getCardById } from '../controllers/cardController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/module/:moduleId', getCardsByModule);
router.get('/:id', getCardById);

export default router;
