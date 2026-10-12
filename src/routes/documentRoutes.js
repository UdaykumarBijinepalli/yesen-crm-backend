import { Router } from 'express';
import Joi from 'joi';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { PERMISSIONS } from '../config/permissions.js';
import validate from '../middleware/validate.js';
import { downloadDocument, deleteDocument } from '../controllers/documentController.js';

const router = Router();

const docIdParam = Joi.object({ docId: Joi.string().hex().length(24).required() });
const read = requirePermission(PERMISSIONS.PIPELINE_READ);
const control = requirePermission(PERMISSIONS.PIPELINE_CONTROL);

router.use(requireAuth);

router.get('/:docId/download', read, validate({ params: docIdParam }), downloadDocument);
router.delete('/:docId', control, validate({ params: docIdParam }), deleteDocument);

export default router;
