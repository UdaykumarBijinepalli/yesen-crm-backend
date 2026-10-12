import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import userRepository from '../repositories/userRepository.js';
import User from '../models/User.js';

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

async function login(username, password) {
  const user = await userRepository.findByUsername(username);
  if (!user) throw ApiError.unauthorized('Invalid username or password');

  if (!user.active) {
    throw ApiError.unauthorized('This account has been deactivated. Contact an administrator.');
  }

  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid username or password');

  const token = signToken(user);
  return { token, user };
}

// Self-service password change (Settings page) - distinct from the
// admin-only PATCH /users/:id, which doesn't require knowing the current
// password. This one does, since the user is changing their own.
async function changePassword(userId, currentPassword, newPassword) {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.unauthorized('Current password is incorrect');

  const passwordHash = await User.hashPassword(newPassword);
  await userRepository.updateById(userId, { passwordHash });
}

export default { login, signToken, changePassword };
