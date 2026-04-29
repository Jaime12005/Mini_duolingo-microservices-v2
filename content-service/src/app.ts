import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/content.routes';
import { errorHandler } from './utils/errorHandler';
import { Request, Response } from 'express';
import { attachUser } from './middlewares/authContext.middleware';



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(attachUser);
app.use('/api/v1/content', routes);

app.get('/health', (_req: Request, res: Response) =>
  res.json({ status: 'ok', service: 'content-service' })
);
app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Content Service listening on port ${port}`);
});

export default app;
