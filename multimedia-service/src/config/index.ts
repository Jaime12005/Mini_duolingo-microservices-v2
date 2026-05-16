import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 4005,
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads'),
  mediaBaseUrl: process.env.MEDIA_BASE_URL || 'http://localhost:4005'
};

export default config;
