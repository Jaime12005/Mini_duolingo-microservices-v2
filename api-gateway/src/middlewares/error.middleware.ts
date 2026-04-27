import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  // do not leak internal details
  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(status).json({ success: false, message, data: null, error: message });
}
