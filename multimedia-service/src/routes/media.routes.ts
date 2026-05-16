import { Router, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import config from '../config';
import { allowedMime, extFromMime } from '../utils/mime';
import { authenticate, RequestWithUser } from '../middleware/auth';

const router = Router();

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const ext = extFromMime(file.mimetype);
    cb(null, `${randomUUID()}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) return cb(new Error('Invalid file type'));
    cb(null, true);
  }
});

router.post('/users/:id/avatar', authenticate, upload.single('file'), (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  const paramId = req.params.id;

  if (!userId || userId !== paramId) {
    return res.status(403).json({ success: false, message: 'Forbidden', data: null, error: 'Invalid user' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File required', data: null, error: 'Missing file' });
  }

  const url = `${config.mediaBaseUrl}/media/${req.file.filename}`;

  return res.json({
    success: true,
    message: 'Avatar uploaded',
    data: { url },
    error: null
  });
});

export default router;