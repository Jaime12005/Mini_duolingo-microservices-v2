import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response } from 'express';

const windowMs = 15 * 60 * 1000; // 15 minutes
const maxRequests = 100; // limit per IP

const options: Options = {
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests',
      data: null,
      error: 'Rate limit exceeded'
    });
  }
};

const rateLimitMiddleware = rateLimit(options);

export default rateLimitMiddleware;
