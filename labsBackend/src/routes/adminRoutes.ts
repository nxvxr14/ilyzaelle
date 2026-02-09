import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserProgress,
  getProgressByModule,
  getProgressByCategory,
} from '../controllers/adminController';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategoriesAdmin,
} from '../controllers/categoryController';
import {
  createModule,
  updateModule,
  deleteModule,
  getAllModulesAdmin,
} from '../controllers/moduleController';
import {
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
  getCardsByModule,
} from '../controllers/cardController';
import { validateCategory } from '../middleware/validation/categoryValidation';
import { validateModule } from '../middleware/validation/moduleValidation';
import { validateCard } from '../middleware/validation/cardValidation';
import authMiddleware from '../middleware/auth';
import adminMiddleware from '../middleware/admin';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getUsers);
router.get('/users/:userId/progress', getUserProgress);

// Progress stats
router.get('/progress/module/:moduleId', getProgressByModule);
router.get('/progress/category/:categoryId', getProgressByCategory);

// Categories CRUD
router.get('/categories', getAllCategoriesAdmin);
router.post('/categories', validateCategory, createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Modules CRUD
router.get('/modules', getAllModulesAdmin);
router.post('/modules', validateModule, createModule);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

// Cards CRUD
router.get('/cards/:moduleId', getCardsByModule);
router.post('/cards', validateCard, createCard);
router.put('/cards/:id', updateCard);
router.delete('/cards/:id', deleteCard);
router.put('/cards/reorder', reorderCards);

export default router;
