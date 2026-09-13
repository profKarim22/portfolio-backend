import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware';
import { adminMutationLimiter } from '../middleware/rateLimiters';
import { validateBody } from '../middleware/validate';
import {
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from '../controllers/projectController';
import { updateStatus, updateApiEndpoint } from '../controllers/configController';
import { changePassword } from '../controllers/authController';
import {
  projectCreateSchema,
  projectUpdateSchema,
  projectReorderSchema,
  statusUpdateSchema,
  changePasswordSchema,
} from '../utils/validators';

const router = express.Router();

// Apply authentication, authorization, and rate-limiting to all admin endpoints
router.use(protect, requireAdmin, adminMutationLimiter);

// Project admin routes
router.post('/projects', validateBody(projectCreateSchema), createProject);
router.put('/projects/:id', validateBody(projectUpdateSchema), updateProject);
router.delete('/projects/:id', deleteProject);
router.patch('/projects/reorder', validateBody(projectReorderSchema), reorderProjects);

// Config admin routes
router.put('/status', validateBody(statusUpdateSchema), updateStatus);
router.put('/api-endpoints/:key', updateApiEndpoint);

// Profile password change route
router.post('/profile/change-password', validateBody(changePasswordSchema), changePassword);

export default router;

