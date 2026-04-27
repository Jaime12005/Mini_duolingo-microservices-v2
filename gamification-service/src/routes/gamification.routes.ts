import { Router } from 'express';
import controller from '../controllers/gamification.controller';

const router = Router();

router.post('/xp/add', controller.addXp);
router.get('/xp/:userId', controller.getXp);

router.post('/streak/update', controller.updateStreak);
router.get('/streak/:userId', controller.getStreak);

router.post('/achievement/unlock', controller.unlockAchievement);
router.get('/achievement/:userId', controller.getAchievements);
router.post('/action', controller.processAction);

export default router;
