import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import userRoutes from './routes/userRoutes';
import authRoutes from './auth/auth.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ✅ Rutas primero
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);

// Health check
app.get('/', (req, res) =>
  res.json({ service: 'user-service', version: '1.0.0' })
);

// ❗ SIEMPRE AL FINAL
app.use(errorHandler);

export default app;