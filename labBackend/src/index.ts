import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { config } from './config/constants';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import moduleRoutes from './routes/moduleRoutes';
import cardRoutes from './routes/cardRoutes';
import badgeRoutes from './routes/badgeRoutes';
import progressRoutes from './routes/progressRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Frontend URL: ${config.frontendUrl}`);
    console.log(`Admin email: ${config.adminEmail}`);
  });
};

startServer();
