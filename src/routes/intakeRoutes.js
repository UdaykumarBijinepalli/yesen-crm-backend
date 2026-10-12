import { Router } from 'express';
import { fromProductForm, fromServiceForm, fromContactForm } from '../controllers/intakeController.js';
import { requireFormsKey } from '../middleware/auth.js';
import { formsLimiter } from '../middleware/rateLimit.js';
import validate from '../middleware/validate.js';
import { contactFormIntake, productServiceFormIntake } from '../validators/intakeValidators.js';

const router = Router();

router.use(formsLimiter, requireFormsKey);

router.post('/product', validate({ body: productServiceFormIntake }), fromProductForm);
router.post('/service', validate({ body: productServiceFormIntake }), fromServiceForm);
router.post('/contact', validate({ body: contactFormIntake }), fromContactForm);

export default router;