import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { loggerMiddleware } from './middlewares/logger.middleware';
import errorMiddleware from './middlewares/error.middleware';
import routes from './routes/word.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Mount API routes (controllers not implemented yet)
app.use('/api/v1/words', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'vocabulary-service' }));

app.use(errorMiddleware);

export default app;
