import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController';
import authMiddleware from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.use(authMiddleware);

router.post('/', upload.single('image'), uploadImage);

export default router;
