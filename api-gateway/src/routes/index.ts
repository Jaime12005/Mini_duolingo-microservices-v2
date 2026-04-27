import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/env';

const router = Router();

// Example: proxy to user-service
router.use('/user', createProxyMiddleware({
  target: config.SERVICES.USER || 'http://localhost:4000',
  changeOrigin: true,
  pathRewrite: { '^/user': '' }
}));

// Add additional proxies per microservice
router.use('/content', createProxyMiddleware({
  target: config.SERVICES.CONTENT || 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: { '^/content': '' }
}));

export default router;
