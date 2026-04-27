import { Request, Response, NextFunction } from 'express';
import * as contentService from '../services/content.service';

export async function createUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required', data: null, error: 'Validation' });
    const unit = await contentService.createUnit({ title, description });
    res.status(201).json({ success: true, message: 'Unit created', data: unit, error: null });
  } catch (err) { next(err); }
}

export async function getUnits(_req: Request, res: Response, next: NextFunction) {
  try {
    const units = await contentService.getAllUnits();
    res.json({ success: true, message: 'OK', data: units, error: null });
  } catch (err) { next(err); }
}

export async function createLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const { unit_id, title, content } = req.body;
    if (!unit_id || !title) return res.status(400).json({ success: false, message: 'unit_id and title required', data: null, error: 'Validation' });
    const lesson = await contentService.createLesson({ unit_id, title, content });
    res.status(201).json({ success: true, message: 'Lesson created', data: lesson, error: null });
  } catch (err) { next(err); }
}

export async function getLessonsByUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { unitId } = req.params;
    const lessons = await contentService.getLessonsByUnit(unitId);
    res.json({ success: true, message: 'OK', data: lessons, error: null });
  } catch (err) { next(err); }
}

export async function createExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const { lesson_id, prompt, correct_answer, type } = req.body;
    if (!lesson_id || !prompt || !correct_answer || !type) return res.status(400).json({ success: false, message: 'lesson_id, prompt, correct_answer and type required', data: null, error: 'Validation' });
    const exercise = await contentService.createExercise({ lesson_id, prompt, correct_answer, type });
    res.status(201).json({ success: true, message: 'Exercise created', data: exercise, error: null });
  } catch (err) { next(err); }
}

export async function getExercisesByLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const { lessonId } = req.params;
    const exercises = await contentService.getExercisesByLesson(lessonId);
    res.json({ success: true, message: 'OK', data: exercises, error: null });
  } catch (err) { next(err); }
}

export async function validateExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const { exerciseId } = req.params;
    const { answer } = req.body;
    if (typeof answer === 'undefined') return res.status(400).json({ success: false, message: 'answer is required', data: null, error: 'Validation' });
    const result = await contentService.validateExerciseAnswer(exerciseId, answer);
    res.json({ success: true, message: 'OK', data: result, error: null });
  } catch (err) { next(err); }
}
