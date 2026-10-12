import userService from '../services/userService.js';
import { serializeUser } from '../utils/permissions.js';

export async function createUser(req, res) {
  const user = await userService.createUser(req.body);
  res.status(201).json({ user: serializeUser(user) });
}

export async function listUsers(req, res) {
  const users = await userService.listUsers();
  res.json({ users: users.map(serializeUser) });
}

export async function updateUser(req, res) {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({ user: serializeUser(user) });
}

export async function deleteUser(req, res) {
  await userService.deleteUser(req.params.id, req.user?._id);
  res.status(204).send();
}
  