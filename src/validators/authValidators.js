import Joi from 'joi';

export const login = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});

export const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

export const forgotPasswordIdentify = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
});

export const forgotPasswordSendOtp = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
});

export const forgotPasswordVerifyOtp = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  otp: Joi.string().trim().length(6).pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'OTP must be a 6-digit code',
  }),
});

export const forgotPasswordReset = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  otp: Joi.string().trim().length(6).pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'OTP must be a 6-digit code',
  }),
  newPassword: Joi.string().min(8).required(),
});
