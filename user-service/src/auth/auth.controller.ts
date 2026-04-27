import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password } = req.body;

    const result = await authService.register(username, email, password);

    res.status(201).json({
      success: true,
      message: 'User registered',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { emailOrUsername, password } = req.body;

    const result = await authService.login(emailOrUsername, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refresh(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    await authService.logout(refreshToken);

    res.json({
      success: true,
      message: 'Logged out successfully',
      data: null
    });
  } catch (err) {
    next(err);
  }
}