import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config';

export interface JwtPayload {
  userId: string;
  email?: string;
}

export function signJwt(payload: { userId: string; email: string }) {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn']
  };

  return jwt.sign(payload, config.jwt.secret, options);
}

export function signRefreshToken(payload: { userId: string }) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '7d'
  });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}