import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 5200,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'pronunciation_service_db'
  }
};

export default config;
