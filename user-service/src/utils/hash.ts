import bcrypt from 'bcrypt';
import config from '../config';

export async function hashPassword(password: string) {
  const saltRounds = config.bcryptSaltRounds;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
