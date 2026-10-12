import bcrypt from 'bcryptjs';
import userRepository from '../repositories/userRepository.js';
import passwordResetOtpRepository from '../repositories/passwordResetOtpRepository.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import config from '../config/env.js';
import { sendOtpEmail } from './emailService.js';

const OTP_LENGTH = 6;
const MAX_VERIFY_ATTEMPTS = 5;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

async function compareOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}

async function getActiveUserWithEmail(username) {
  const user = await userRepository.findByUsername(username);
  if (!user || !user.active) {
    throw ApiError.notFound('No active account found for this username');
  }

  const email = String(user.email || '').trim().toLowerCase();
  if (!email) {
    throw ApiError.badRequest('No email is registered for this account. Contact an administrator.');
  }

  return { user, email };
}

async function identifyAccount(username) {
  const { user, email } = await getActiveUserWithEmail(username);
  return {
    username: user.username,
    email,
    name: user.name,
  };
}

async function sendOtp(username) {
  const { user, email } = await getActiveUserWithEmail(username);
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + config.passwordReset.otpExpiryMinutes * 60 * 1000);

  await passwordResetOtpRepository.deleteForUser(user._id);
  await passwordResetOtpRepository.create({
    userId: user._id,
    otpHash,
    expiresAt,
    attempts: 0,
    verified: false,
  });

  await sendOtpEmail({ to: email, name: user.name, otp });

  return {
    message: 'Verification code sent',
    expiresInMinutes: config.passwordReset.otpExpiryMinutes,
  };
}

async function getValidOtpRecord(userId) {
  const record = await passwordResetOtpRepository.findLatestForUser(userId);
  if (!record) {
    throw ApiError.badRequest('Request a new verification code first');
  }

  if (record.expiresAt < new Date()) {
    await passwordResetOtpRepository.deleteById(record._id);
    throw ApiError.badRequest('Verification code has expired. Request a new one.');
  }

  return record;
}

async function verifyOtp(username, otp) {
  const { user } = await getActiveUserWithEmail(username);
  const record = await getValidOtpRecord(user._id);

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    await passwordResetOtpRepository.deleteById(record._id);
    throw ApiError.badRequest('Too many failed attempts. Request a new verification code.');
  }

  const matches = await compareOtp(String(otp).trim(), record.otpHash);
  if (!matches) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest('Invalid verification code');
  }

  record.verified = true;
  await record.save();

  return { verified: true };
}

async function resetPassword(username, otp, newPassword) {
  const { user } = await getActiveUserWithEmail(username);
  const record = await getValidOtpRecord(user._id);

  if (!record.verified) {
    throw ApiError.badRequest('Verify the code before changing your password');
  }

  const matches = await compareOtp(String(otp).trim(), record.otpHash);
  if (!matches) {
    throw ApiError.badRequest('Invalid verification code');
  }

  const passwordHash = await User.hashPassword(newPassword);
  await userRepository.updateById(user._id, { passwordHash });
  await passwordResetOtpRepository.deleteForUser(user._id);

  return { success: true };
}

export default {
  identifyAccount,
  sendOtp,
  verifyOtp,
  resetPassword,
};
