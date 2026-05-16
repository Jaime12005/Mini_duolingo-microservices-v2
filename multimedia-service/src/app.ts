import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import config from './config';
import mediaRoutes from './routes/media.routes';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({ origin: config.frontendOrigin, credentials: true }));
app.use(morgan('dev'));

app.use('/media', express.static(path.resolve(config.uploadDir)));

app.use('/api/v1/media', mediaRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large', data: null, error: 'Max 2MB' });
  }
  if (err?.message === 'Invalid file type') {
    return res.status(400).json({ success: false, message: 'Invalid file type', data: null, error: 'Only png/jpg/webp' });
  }
  return res.status(500).json({ success: false, message: 'Upload error', data: null, error: 'Internal error' });
});

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Service healthy', data: { service: 'multimedia-service' }, error: null });
});

export default app;