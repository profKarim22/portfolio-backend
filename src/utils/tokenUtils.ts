import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { IAdmin } from '../models/Admin';
import RefreshToken from '../models/RefreshToken';

export interface TokenPayload {
  sub: string;
  id: string; // for backwards compatibility
  email: string;
  role: string;
  jti: string;
}

export const generateAccessToken = (admin: IAdmin): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const payload: TokenPayload = {
    sub: admin._id.toString(),
    id: admin._id.toString(),
    email: admin.email,
    role: admin.role || 'admin',
    jti: crypto.randomUUID(),
  };

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
  });
};

export const createRefreshTokenSession = async (
  admin: IAdmin,
  ip?: string,
  userAgent?: string
): Promise<string> => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresDays = parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10);
  const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    token,
    admin: admin._id,
    expiresAt,
    ip,
    userAgent,
    revoked: false,
  });

  return token;
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  const expiresDays = parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10);

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: expiresDays * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
};
