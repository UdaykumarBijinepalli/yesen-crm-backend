import { Router } from 'express';

import authRoutes from './authRoutes.js';
import intakeRoutes from './intakeRoutes.js';
import inquiryRoutes from './inquiryRoutes.js';
import documentRoutes from './documentRoutes.js';
import userRoutes from './userRoutes.js';
import metaRoutes from './metaRoutes.js';
import projectRoutes from './projectRoutes.js';
import testimonialRoutes from './testimonialRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/forms', intakeRoutes); // public website form intake (has its own stricter limiter)
router.use('/inquiries', inquiryRoutes); // Kanban board + drawer
router.use('/documents', documentRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/meta', metaRoutes);

export default router;
