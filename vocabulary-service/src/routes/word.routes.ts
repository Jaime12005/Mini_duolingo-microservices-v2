import { Router } from 'express';
import * as wordController from '../controllers/word.controller';

const router = Router();

router.get('/', wordController.getAllWords);
router.get('/:id', wordController.getWordById);
router.post('/', wordController.createWord);

export default router;