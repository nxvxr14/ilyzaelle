import { Router } from 'express';
import {
  createModule,
  getModuleById,
  updateModule,
  deleteModule,
  reorderModules,
} from '../controllers/moduleController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../config/multer';

const router = Router();

// Authenticated
router.get('/:id', authenticate, getModuleById);

// Admin only
router.post('/', authenticate, requireAdmin, upload.single('coverImage'), createModule);
router.put('/:id', authenticate, requireAdmin, upload.single('coverImage'), updateModule);
router.delete('/:id', authenticate, requireAdmin, deleteModule);
router.put('/reorder/batch', authenticate, requireAdmin, reorderModules);

export default router;
