import express from 'express';
import { loginAdmin, getMe, logoutAdmin } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { createProject, updateProject, deleteProject, reorderProjects } from '../controllers/projectController';
import { updateStatus, updateApiEndpoint } from '../controllers/configController';

const router = express.Router();

// Auth routes
router.post('/auth/login', loginAdmin);
router.post('/auth/logout', logoutAdmin);
router.get('/auth/me', protect, getMe);

// Project admin routes
router.post('/projects', protect, createProject);
router.put('/projects/:id', protect, updateProject);
router.delete('/projects/:id', protect, deleteProject);
router.patch('/projects/reorder', protect, reorderProjects);

// Config admin routes
router.put('/status', protect, updateStatus);
router.put('/api-endpoints/:key', protect, updateApiEndpoint);

export default router;
