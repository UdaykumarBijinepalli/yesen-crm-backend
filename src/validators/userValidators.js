import Joi from 'joi';
import { ALL_PERMISSIONS } from '../config/permissions.js';

const permissionSchema = Joi.array()
  .items(Joi.string().valid(...ALL_PERMISSIONS))
  .unique();

export const createUser = Joi.object({
  name: Joi.string().trim().min(1).required(),
  username: Joi.string().trim().alphanum().min(3).max(30).required(),
  email: Joi.string().trim().email().allow(''),
  password: Joi.string().min(8).required(),
  role: Joi.string(),
  active: Joi.boolean(),
  permissions: permissionSchema,
});

export const updateUser = Joi.object({
  name: Joi.string().trim().min(1),
  email: Joi.string().trim().email().allow(''),
  role: Joi.string().valid('admin', 'staff'),
  active: Joi.boolean(),
  password: Joi.string().min(8),
  permissions: permissionSchema,
}).min(1);
