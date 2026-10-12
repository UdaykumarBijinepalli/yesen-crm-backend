import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { PERMISSIONS } from '../config/permissions.js';
import { projectImageUpload } from '../middleware/projectUpload.js';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from '../controllers/projectController.js';

const router = Router();
const read = requirePermission(PERMISSIONS.PROJECTS_READ);
const create = requirePermission(PERMISSIONS.PROJECTS_CREATE);
const update = requirePermission(PERMISSIONS.PROJECTS_UPDATE);
const remove = requirePermission(PERMISSIONS.PROJECTS_DELETE);

router.use(requireAuth);

router.get('/', read, listProjects);
router.get('/:id', read, getProject);
router.post('/', create, projectImageUpload.single('image'), createProject);
router.patch('/:id', update, projectImageUpload.single('image'), updateProject);
router.delete('/:id', remove, deleteProject);

export default router;
