import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '2525', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:6789',
  adminEmail: process.env.ADMIN_EMAIL || '',
  uploadsDir: process.env.UPLOADS_DIR || './uploads',
  jwtSecret: process.env.JWT_SECRET || 'lab-lms-secret-key-dev',
  maxFileSize: 50 * 1024 * 1024, // 50MB
};
