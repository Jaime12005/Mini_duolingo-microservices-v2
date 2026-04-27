import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 🔐 Todas protegidas
router.get('/me', authenticate, userController.getMe);
router.put('/me', authenticate, userController.updateUser);
router.delete('/me', authenticate, userController.deleteUser);

router.get('/me/profile', authenticate, userController.getProfile);
router.put('/me/profile', authenticate, userController.updateProfile);

router.get('/me/streak', authenticate, userController.getStreak);

export default router;