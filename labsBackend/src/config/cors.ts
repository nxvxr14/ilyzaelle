import cors from 'cors';

const createCorsConfig = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  return cors({
    origin: [frontendUrl, 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
};

export default createCorsConfig;
