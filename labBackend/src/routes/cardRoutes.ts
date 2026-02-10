import { Router } from 'express';
import {
  createCard,
  getCardById,
  updateCard,
  deleteCard,
  uploadCardImage,
  reorderCards,
} from '../controllers/cardController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../config/multer';

const router = Router();

// Authenticated
router.get('/:id', authenticate, getCardById);

// Admin only
router.post('/', authenticate, requireAdmin, createCard);
router.put('/:id', authenticate, requireAdmin, updateCard);
router.delete('/:id', authenticate, requireAdmin, deleteCard);
router.post('/upload-image', authenticate, requireAdmin, upload.single('image'), uploadCardImage);
router.put('/reorder/batch', authenticate, requireAdmin, reorderCards);

export default router;
