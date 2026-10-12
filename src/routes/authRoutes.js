import { Router } from 'express';
import {
  login,
  me,
  changePassword,
  forgotPasswordIdentify,
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  forgotPasswordReset,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import validate from '../middleware/validate.js';
import * as authValidators from '../validators/authValidators.js';

const router = Router();

router.post('/login', authLimiter, validate({ body: authValidators.login }), login);
router.post(
  '/forgot-password/identify',
  authLimiter,
  validate({ body: authValidators.forgotPasswordIdentify }),
  forgotPasswordIdentify
);
router.post(
  '/forgot-password/send-otp',
  authLimiter,
  validate({ body: authValidators.forgotPasswordSendOtp }),
  forgotPasswordSendOtp
);
router.post(
  '/forgot-password/verify-otp',
  authLimiter,
  validate({ body: authValidators.forgotPasswordVerifyOtp }),
  forgotPasswordVerifyOtp
);
router.post(
  '/forgot-password/reset',
  authLimiter,
  validate({ body: authValidators.forgotPasswordReset }),
  forgotPasswordReset
);
router.get('/me', requireAuth, me);
router.patch('/password', requireAuth, validate({ body: authValidators.changePassword }), changePassword);

export default router;
