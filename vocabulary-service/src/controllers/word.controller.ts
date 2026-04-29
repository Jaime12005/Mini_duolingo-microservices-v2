import { Request, Response, NextFunction } from 'express';
import * as wordService from '../services/word.service';
import AppError from '../utils/AppError';

export async function getAllWords(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await wordService.getAllWords();

    res.json({
      success: true,
      message: 'Words retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
}

export async function getWordById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      throw new AppError('Invalid ID', 400);
    }

    const data = await wordService.getWordById(id);

    res.json({
      success: true,
      message: 'Word retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
}

export async function createWord(req: Request, res: Response, next: NextFunction) {
  try {
    const { word, language, ipa, audio_url } = req.body;

    if (!word) {
      throw new AppError('Word is required', 400);
    }

    const data = await wordService.createWord({
      word,
      language,
      ipa,
      audio_url
    });

    res.status(201).json({
      success: true,
      message: 'Word created successfully',
      data
    });
  } catch (error) {
    next(error);
  }
}

export async function searchWord(req: Request, res: Response, next: NextFunction) {
  try {
    const { word } = req.query;

    if (!word || typeof word !== 'string') {
      throw new AppError('Query param "word" is required', 400);
    }

    const data = await wordService.searchWord(word);

    res.json({
      success: true,
      message: 'Word found',
      data
    });
  } catch (error) {
    next(error);
  }
}