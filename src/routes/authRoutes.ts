import express from 'express';
import {
  loginAdmin,
  getMe,
  logoutAdmin,
  refreshAccessToken,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiters';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../utils/validators';

const router = express.Router();

router.post('/login', authLimiter, validateBody(loginSchema), loginAdmin);
router.post('/logout', logoutAdmin);
router.post('/refresh', authLimiter, refreshAccessToken);
router.get('/me', protect, getMe);

export default router;

