import { Router } from 'express';
import controller from '../controllers/pronunciation.controller';
import multer from 'multer';


const router = Router();

router.post('/evaluate', controller.evaluate);

const upload = multer({ dest: 'uploads/' });

router.post(
  '/evaluate-audio',
  upload.single('audio'),
  controller.evaluateAudio
);

export default router;
