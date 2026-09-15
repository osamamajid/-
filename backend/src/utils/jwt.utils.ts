import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { JWTPayload } from '../types';

export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: (ENV.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
};
