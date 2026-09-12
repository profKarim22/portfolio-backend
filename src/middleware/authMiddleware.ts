import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin, { IAdmin } from '../models/Admin';

export interface AuthRequest extends Request {
  admin?: IAdmin;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      const admin = await Admin.findById(decoded.id).select('-passwordHash');
      
      if (!admin) {
        return res.status(401).json({ success: false, error: { message: 'Not authorized, admin not found' } });
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, error: { message: 'Not authorized, token failed' } });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'Not authorized, no token' } });
  }
};
