import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission, requireAnyPermission } from '../middleware/permissions.js';
import { PERMISSIONS, PERMISSION_GROUPS } from '../config/permissions.js';
import { PIPELINE_STAGES, INQUIRY_SOURCES } from '../config/pipeline.js';
import userService from '../services/userService.js';

const router = Router();
const pipelineRead = requirePermission(PERMISSIONS.PIPELINE_READ);

// So the Admin Panel frontend doesn't have to hard-code the stage list too
// — it reads the single source of truth from here.
router.get('/pipeline', requireAuth, pipelineRead, (req, res) => {
  res.json({ stages: PIPELINE_STAGES, sources: INQUIRY_SOURCES });
});

// Active team roster for assignment pickers.
router.get('/team', requireAuth, pipelineRead, async (req, res) => {
  const team = await userService.listTeam();
  res.json({ team });
});

// Permission catalog for the user-management UI.
router.get(
  '/permissions',
  requireAuth,
  requireAnyPermission(PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_UPDATE),
  (_req, res) => {
    res.json({ groups: PERMISSION_GROUPS });
  }
);

export default router;
