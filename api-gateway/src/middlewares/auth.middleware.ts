import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

export const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ success: false, message: 'Unauthorized', data: null, error: 'Missing Authorization header' });
  }

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ success: false, message: 'Unauthorized', data: null, error: 'Invalid Authorization format' });
  }

  const token = parts[1];
  req.token = token;

  if (!config.JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.error('JWT_SECRET not configured in environment');
    return res.status(500).json({ success: false, message: 'Server configuration error', data: null, error: 'Missing JWT secret' });
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn('JWT verification failed:', err && err.message ? err.message : err);
    return res.status(401).json({ success: false, message: 'Unauthorized', data: null, error: 'Invalid or expired token' });
  }
};

export default authMiddleware;
