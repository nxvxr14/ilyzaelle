import { Router } from 'express';
import {
  createCourse,
  getAllCourses,
  getPublishedCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  uploadCourseCover,
} from '../controllers/courseController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../config/multer';

const router = Router();

// Public
router.get('/published', getPublishedCourses);

// Authenticated
router.get('/', authenticate, getAllCourses);
router.get('/:id', authenticate, getCourseById);
router.post('/:id/enroll', authenticate, enrollInCourse);
router.delete('/:id/enroll', authenticate, unenrollFromCourse);

// Admin only
router.post('/', authenticate, requireAdmin, createCourse);
router.put('/:id', authenticate, requireAdmin, updateCourse);
router.delete('/:id', authenticate, requireAdmin, deleteCourse);
router.put('/:id/cover', authenticate, requireAdmin, upload.single('coverImage'), uploadCourseCover);

export default router;
