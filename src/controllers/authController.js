import authService from '../services/authService.js';
import passwordResetService from '../services/passwordResetService.js';
import { serializeUser } from '../utils/permissions.js';

export async function login(req, res) {
  const { username, password } = req.body;
  const { token, user } = await authService.login(username, password);
  res.json({ token, user: serializeUser(user) });
}

export async function me(req, res) {
  res.json({ user: serializeUser(req.user) });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  res.json({ success: true });
}

export async function forgotPasswordIdentify(req, res) {
  const account = await passwordResetService.identifyAccount(req.body.username);
  res.json({ account });
}

export async function forgotPasswordSendOtp(req, res) {
  const result = await passwordResetService.sendOtp(req.body.username);
  res.json(result);
}

export async function forgotPasswordVerifyOtp(req, res) {
  const result = await passwordResetService.verifyOtp(req.body.username, req.body.otp);
  res.json(result);
}

export async function forgotPasswordReset(req, res) {
  const { username, otp, newPassword } = req.body;
  const result = await passwordResetService.resetPassword(username, otp, newPassword);
  res.json(result);
}
