import { Router } from 'express';
import {
  getModulesByCategory,
  getModuleById,
} from '../controllers/moduleController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/category/:categoryId', getModulesByCategory);
router.get('/:id', getModuleById);

export default router;
