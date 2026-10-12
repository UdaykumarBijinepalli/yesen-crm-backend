import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { PERMISSIONS } from '../config/permissions.js';
import { upload } from '../middleware/upload.js';
import validate from '../middleware/validate.js';

import {
  listInquiries,
  getInquiry,
  updateInquiry,
  moveStage,
  addTag,
  removeTag,
  setQuotationStatus,
  deleteInquiry,
} from '../controllers/inquiryController.js';
import { fromProductForm, fromServiceForm, fromContactForm } from '../controllers/intakeController.js';
import { addLog, listLogs } from '../controllers/logController.js';
import { uploadDocument, listDocuments } from '../controllers/documentController.js';

import * as inquiryValidators from '../validators/inquiryValidators.js';
import * as logValidators from '../validators/logValidators.js';
import * as documentValidators from '../validators/documentValidators.js';
import { contactFormIntake, productServiceFormIntake } from '../validators/intakeValidators.js';

const router = Router();
const read = requirePermission(PERMISSIONS.PIPELINE_READ);
const control = requirePermission(PERMISSIONS.PIPELINE_CONTROL);

router.use(requireAuth);

router.post('/intake/product', control, validate({ body: productServiceFormIntake }), fromProductForm);
router.post('/intake/service', control, validate({ body: productServiceFormIntake }), fromServiceForm);
router.post('/intake/contact', control, validate({ body: contactFormIntake }), fromContactForm);

router.get('/', read, validate({ query: inquiryValidators.listQuery }), listInquiries);
router.get('/:id', read, validate({ params: inquiryValidators.idParam }), getInquiry);
router.patch(
  '/:id',
  control,
  validate({ params: inquiryValidators.idParam, body: inquiryValidators.updateInquiry }),
  updateInquiry
);
router.delete('/:id', control, validate({ params: inquiryValidators.idParam }), deleteInquiry);

router.patch(
  '/:id/stage',
  control,
  validate({ params: inquiryValidators.idParam, body: inquiryValidators.moveStage }),
  moveStage
);

router.post(
  '/:id/tags',
  control,
  validate({ params: inquiryValidators.idParam, body: inquiryValidators.tagBody }),
  addTag
);
router.delete('/:id/tags/:tag', control, validate({ params: inquiryValidators.tagParam }), removeTag);

router.patch(
  '/:id/quotation',
  control,
  validate({ params: inquiryValidators.idParam, body: inquiryValidators.quotationStatus }),
  setQuotationStatus
);

router.get('/:id/logs', read, validate({ params: inquiryValidators.idParam }), listLogs);
router.post(
  '/:id/logs',
  control,
  validate({ params: inquiryValidators.idParam, body: logValidators.addLog }),
  addLog
);

router.get('/:id/documents', read, validate({ params: inquiryValidators.idParam }), listDocuments);
router.post(
  '/:id/documents',
  control,
  validate({ params: inquiryValidators.idParam }),
  upload.single('file'),
  validate({ body: documentValidators.uploadDocument }),
  uploadDocument
);

export default router;
