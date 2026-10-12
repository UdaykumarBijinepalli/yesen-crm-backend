import { Router } from 'express';
import Joi from 'joi';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { PERMISSIONS } from '../config/permissions.js';
import validate from '../middleware/validate.js';
import { createUser, listUsers, updateUser, deleteUser } from '../controllers/userController.js';
import * as userValidators from '../validators/userValidators.js';

const router = Router();

const idParam = Joi.object({ id: Joi.string().hex().length(24).required() });

router.use(requireAuth);

router.get('/', requirePermission(PERMISSIONS.USERS_READ), listUsers);
router.post('/', requirePermission(PERMISSIONS.USERS_CREATE), validate({ body: userValidators.createUser }), createUser);
router.patch(
  '/:id',
  requirePermission(PERMISSIONS.USERS_UPDATE),
  validate({ params: idParam, body: userValidators.updateUser }),
  updateUser
);
router.delete('/:id', requirePermission(PERMISSIONS.USERS_DELETE), validate({ params: idParam }), deleteUser);

export default router;
