import { Router } from 'express';
import * as controller from '../controllers/content.controller';

const router = Router();

// Units
router.post('/units', controller.createUnit);
router.get('/units', controller.getUnits);

// Lessons
router.post('/lessons', controller.createLesson);
router.get('/units/:unitId/lessons', controller.getLessonsByUnit);

// Exercises
router.post('/exercises', controller.createExercise);
router.get('/lessons/:lessonId/exercises', controller.getExercisesByLesson);
router.post('/exercises/:exerciseId/validate', controller.validateExercise);

export default router;
