import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { PERMISSIONS } from '../config/permissions.js';
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonial,
  listTestimonials,
  updateTestimonial,
} from '../controllers/testimonialController.js';

const router = Router();
const read = requirePermission(PERMISSIONS.TESTIMONIALS_READ);
const create = requirePermission(PERMISSIONS.TESTIMONIALS_CREATE);
const update = requirePermission(PERMISSIONS.TESTIMONIALS_UPDATE);
const remove = requirePermission(PERMISSIONS.TESTIMONIALS_DELETE);

router.use(requireAuth);

router.get('/', read, listTestimonials);
router.get('/:id', read, getTestimonial);
router.post('/', create, createTestimonial);
router.patch('/:id', update, updateTestimonial);
router.delete('/:id', remove, deleteTestimonial);

export default router;
