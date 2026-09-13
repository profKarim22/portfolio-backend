import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin, { IAdmin } from '../models/Admin';
import { logSecurityEvent } from '../utils/securityLogger';

export interface AuthRequest extends Request {
  admin?: IAdmin;
  user?: IAdmin;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    // 2. Check accessToken cookie
    token = req.cookies.accessToken;
  }

  if (!token) {
    logSecurityEvent({
      event: 'UNAUTHORIZED_ACCESS',
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
      details: 'Missing authentication token',
    });

    return res.status(401).json({
      success: false,
      error: {
        message: 'Not authorized: Authentication token is required',
        code: 'UNAUTHORIZED',
      },
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured on server');
    }

    const decoded: any = jwt.verify(token, secret);

    const admin = await Admin.findById(decoded.sub || decoded.id).select('-passwordHash');
    if (!admin) {
      logSecurityEvent({
        event: 'UNAUTHORIZED_ACCESS',
        ip: req.ip,
        path: req.originalUrl,
        method: req.method,
        details: 'User no longer exists',
      });

      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authorized: User account no longer exists',
          code: 'ACCOUNT_NOT_FOUND',
        },
      });
    }

    // Check if password was changed after token was issued
    if (admin.passwordChangedAt) {
      const changedTimestamp = Math.floor(admin.passwordChangedAt.getTime() / 1000);
      if (decoded.iat && decoded.iat < changedTimestamp) {
        logSecurityEvent({
          event: 'UNAUTHORIZED_ACCESS',
          ip: req.ip,
          userId: admin._id.toString(),
          details: 'Token invalidated by password change',
        });

        return res.status(401).json({
          success: false,
          error: {
            message: 'Session invalidated due to password change. Please log in again.',
            code: 'SESSION_REVOKED',
          },
        });
      }
    }

    req.admin = admin;
    req.user = admin;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      logSecurityEvent({
        event: 'UNAUTHORIZED_ACCESS',
        ip: req.ip,
        path: req.originalUrl,
        method: req.method,
        details: 'Access token expired',
      });

      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication token has expired. Please refresh or log in again.',
          code: 'TOKEN_EXPIRED',
        },
      });
    }

    logSecurityEvent({
      event: 'UNAUTHORIZED_ACCESS',
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
      details: `Token verification failed: ${error.message}`,
    });

    return res.status(401).json({
      success: false,
      error: {
        message: 'Not authorized: Invalid token',
        code: 'INVALID_TOKEN',
      },
    });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.admin || req.admin.role !== 'admin') {
    logSecurityEvent({
      event: 'FORBIDDEN_ACCESS',
      ip: req.ip,
      userId: req.admin?._id?.toString(),
      path: req.originalUrl,
      method: req.method,
      details: 'Non-admin user attempted to access admin resource',
    });

    return res.status(403).json({
      success: false,
      error: {
        message: 'Forbidden: Administrator privileges required',
        code: 'FORBIDDEN',
      },
    });
  }

  next();
};

