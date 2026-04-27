import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  console.error('Error:', err);

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: message
  });
}

export default errorMiddleware;