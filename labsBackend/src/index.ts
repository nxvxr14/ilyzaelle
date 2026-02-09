import dotenv from 'dotenv';
dotenv.config();

import createServer from './config/server';
import connectDB from './config/db';
import errorHandler from './utils/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import moduleRoutes from './routes/moduleRoutes';
import cardRoutes from './routes/cardRoutes';
import progressRoutes from './routes/progressRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const app = createServer();
  const PORT = process.env.PORT || 2525;

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/modules', moduleRoutes);
  app.use('/api/cards', cardRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Labs API is running' });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Labs API running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
