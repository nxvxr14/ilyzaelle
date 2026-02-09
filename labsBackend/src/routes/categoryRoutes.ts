import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
} from '../controllers/categoryController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getCategories);
router.get('/:id', getCategoryById);

export default router;
