import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import RefreshToken from '../models/RefreshToken';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  generateAccessToken,
  createRefreshTokenSession,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../utils/tokenUtils';
import { logSecurityEvent } from '../utils/securityLogger';

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin || !(await admin.matchPassword(password))) {
      logSecurityEvent({
        event: 'LOGIN_FAILED',
        ip: req.ip,
        email: normalizedEmail,
        details: 'Invalid email or password attempt',
      });

      // Generic message to prevent user enumeration
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials.',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // 1. Generate short-lived access token (15m)
    const accessToken = generateAccessToken(admin);

    // 2. Generate long-lived revocable refresh token session (7d)
    const refreshToken = await createRefreshTokenSession(
      admin,
      req.ip,
      req.headers['user-agent']
    );

    // 3. Set HttpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    logSecurityEvent({
      event: 'LOGIN_SUCCESS',
      ip: req.ip,
      userId: admin._id.toString(),
      email: admin.email,
    });

    // 4. Return response with access token for immediate API use
    return res.json({
      success: true,
      data: {
        _id: admin.id,
        email: admin.email,
        role: admin.role || 'admin',
        token: accessToken,
        expiresIn: 900, // 15 minutes in seconds
      },
    });
  } catch (error) {
    logSecurityEvent({
      event: 'LOGIN_FAILED',
      ip: req.ip,
      details: (error as Error).message,
    });
    return res.status(500).json({
      success: false,
      error: {
        message: 'An error occurred during authentication.',
        code: 'INTERNAL_AUTH_ERROR',
      },
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const admin = await Admin.findById(req.admin?._id).select('-passwordHash');
    if (admin) {
      return res.json({
        success: true,
        data: {
          _id: admin.id,
          email: admin.email,
          role: admin.role || 'admin',
          createdAt: (admin as any).createdAt,
          updatedAt: (admin as any).updatedAt,
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        error: { message: 'Admin not found', code: 'NOT_FOUND' },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Error retrieving profile', code: 'INTERNAL_ERROR' },
    });
  }
};

export const logoutAdmin = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      await RefreshToken.findOneAndUpdate(
        { token: refreshToken, revoked: false },
        { revoked: true, revokedAt: new Date() }
      );
    }

    clearRefreshTokenCookie(res);

    logSecurityEvent({
      event: 'LOGOUT',
      ip: req.ip,
      details: 'Session successfully revoked',
    });

    return res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      logSecurityEvent({
        event: 'UNAUTHORIZED_ACCESS',
        ip: req.ip,
        details: 'Missing refresh token for session refresh',
      });
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token is required',
          code: 'REFRESH_TOKEN_REQUIRED',
        },
      });
    }

    const session = await RefreshToken.findOne({
      token: refreshToken,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      clearRefreshTokenCookie(res);
      logSecurityEvent({
        event: 'TOKEN_REVOKED',
        ip: req.ip,
        details: 'Attempted to use invalid or revoked refresh token',
      });
      return res.status(401).json({
        success: false,
        error: {
          message: 'Session expired or invalidated. Please log in again.',
          code: 'INVALID_SESSION',
        },
      });
    }

    const admin = await Admin.findById(session.admin);
    if (!admin) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        error: { message: 'User account not found', code: 'ACCOUNT_NOT_FOUND' },
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(admin);

    logSecurityEvent({
      event: 'TOKEN_REFRESHED',
      ip: req.ip,
      userId: admin._id.toString(),
      email: admin.email,
    });

    return res.json({
      success: true,
      data: {
        token: newAccessToken,
        expiresIn: 900,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to refresh token', code: 'REFRESH_ERROR' },
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: { message: 'Admin not found', code: 'NOT_FOUND' },
      });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      logSecurityEvent({
        event: 'PASSWORD_CHANGED',
        ip: req.ip,
        userId: admin._id.toString(),
        details: 'Password change failed: incorrect current password',
      });

      return res.status(400).json({
        success: false,
        error: {
          message: 'Current password is incorrect.',
          code: 'INCORRECT_PASSWORD',
        },
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    admin.passwordHash = await bcrypt.hash(newPassword, salt);
    admin.passwordChangedAt = new Date();
    await admin.save();

    // Revoke all active refresh sessions for this admin
    await RefreshToken.updateMany(
      { admin: admin._id, revoked: false },
      { revoked: true, revokedAt: new Date() }
    );

    clearRefreshTokenCookie(res);

    logSecurityEvent({
      event: 'PASSWORD_CHANGED',
      ip: req.ip,
      userId: admin._id.toString(),
      email: admin.email,
      details: 'Password changed successfully; all sessions revoked',
    });

    return res.json({
      success: true,
      data: {
        message: 'Password changed successfully. All other sessions revoked. Please log in again.',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Error changing password', code: 'INTERNAL_ERROR' },
    });
  }
};

