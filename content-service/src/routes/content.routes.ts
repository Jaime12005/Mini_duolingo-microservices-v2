import { Router } from 'express';
import * as controller from '../controllers/content.controller';
import multer from 'multer';
import type { Request } from 'express';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Units
router.post('/units', controller.createUnit);
router.get('/units', controller.getUnits);
router.get('/units-with-progress', controller.getUnitsWithProgress);
router.get('/units/:unitId/lessons/locked', controller.getLessonsByUnitWithLock);
// Lessons
router.post('/lessons', controller.createLesson);
router.get('/units/:unitId/lessons', controller.getLessonsByUnit);
router.get('/lessons/:lessonId/exercises', controller.getExercisesByLesson);
router.get('/progress', controller.getUserProgress);
router.get('/lessons/:lessonId/lives', controller.getLessonLives);

// Exercises
router.post('/exercises', controller.createExercise);
router.post('/exercises/:exerciseId/validate', controller.validateExercise);
router.post('/exercises/:exerciseId/validate-audio', upload.single('audio'), controller.validateExerciseAudio);
router.post('/lessons/complete', controller.completeLesson);
router.get('/exercises', controller.getExercises);
router.get('/exercises/:id', controller.getExerciseById);

export default router;