import { Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { RequestWithUser } from '../types';

export function authenticate(req: RequestWithUser, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyJwt(token);

    req.userId = decoded.userId; // ✅ AQUÍ SE GUARDA BIEN

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}