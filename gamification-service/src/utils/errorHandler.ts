import { Request, Response, NextFunction } from 'express';
import AppError from './AppError';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // eslint-disable-next-line no-console
  console.error(err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, data: null, error: err.message });
  }
  res.status(500).json({ success: false, message: 'Internal Server Error', data: null, error: 'Internal Server Error' });
}

export default errorHandler;
