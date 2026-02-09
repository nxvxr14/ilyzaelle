import express from 'express';
import morgan from 'morgan';
import path from 'path';
import createCorsConfig from './cors';

const createServer = () => {
  const app = express();

  // Middleware
  app.use(createCorsConfig());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  const uploadsDir = process.env.UPLOADS_DIR || './uploads';
  app.use('/api/uploads', express.static(path.resolve(uploadsDir)));

  return app;
};

export default createServer;
