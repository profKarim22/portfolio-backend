import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { AuthRequest } from '../middleware/authMiddleware';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: admin.id,
          email: admin.email,
          token: generateToken(admin.id),
        }
      });
    } else {
      res.status(401).json({ success: false, error: { message: 'Invalid email or password' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const admin = await Admin.findById(req.admin?._id).select('-passwordHash');
    if (admin) {
      res.json({
        success: true,
        data: admin,
      });
    } else {
      res.status(404).json({ success: false, error: { message: 'Admin not found' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const logoutAdmin = async (req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Logged out successfully' } });
};
