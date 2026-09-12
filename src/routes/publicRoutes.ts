import express from 'express';
import { getProjects, getProjectById } from '../controllers/projectController';
import { getProfile, getSkills, getStatus, getApiEndpoint } from '../controllers/configController';

const router = express.Router();

router.get('/profile', getProfile);
router.get('/projects', getProjects);
router.get('/projects/:id', getProjectById);
router.get('/skills', getSkills);
router.get('/status', getStatus);
router.get('/api-endpoints/:key', getApiEndpoint);

export default router;
