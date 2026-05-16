import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema, updateProfileSchema, changePasswordSchema } from '../validators/user.validation';

const router = Router();

// 🔐 Todas protegidas
router.get('/me', authenticate, userController.getMe);
router.delete('/me', authenticate, userController.deleteUser);

router.put('/me', authenticate, validate(updateUserSchema), userController.updateUser);
router.put('/me/password', authenticate, validate(changePasswordSchema), userController.changePassword);

router.get('/me/profile', authenticate, userController.getProfile);
router.put('/me/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);

router.get('/me/streak', authenticate, userController.getStreak);

export default router;