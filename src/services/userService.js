import User from '../models/User.js';
import userRepository from '../repositories/userRepository.js';
import ApiError from '../utils/ApiError.js';

async function createUser({ name, username, email, password, role, permissions, active }) {
  const existing = await userRepository.findByUsername(username);
  if (existing) throw ApiError.conflict('Username already exists');

  const passwordHash = await User.hashPassword(password);
  return userRepository.create({
    name,
    username: username.toLowerCase(),
    email,
    passwordHash,
    role: role === 'admin' ? 'admin' : 'staff',
    permissions: permissions ?? [],
    active: active !== false,
  });
}

function listUsers() {
  return userRepository.findAll();
}

function listTeam() {
  return userRepository.findActiveTeam();
}

async function updateUser(id, updates) {
  const patch = { ...updates };
  if (patch.password) {
    patch.passwordHash = await User.hashPassword(patch.password);
    delete patch.password;
  }

  const user = await userRepository.updateById(id, patch);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function deleteUser(id, actingUserId) {
  if (actingUserId && String(actingUserId) === String(id)) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const user = await userRepository.deleteById(id);
  if (!user) throw ApiError.notFound('User not found');
}

export default { createUser, listUsers, listTeam, updateUser, deleteUser };
