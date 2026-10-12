import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import userRepository from '../repositories/userRepository.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.active) {
      return next(ApiError.unauthorized('Your account is inactive or the session is invalid'));
    }
    req.user = user;
    return next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    return next();
  };
}

// Shared-secret check for public website form submissions — visitors
// submitting these forms aren't logged in, so this isn't user auth, just
// a gate against arbitrary internet POSTs.
export function requireFormsKey(req, res, next) {
  const key = req.headers['x-forms-key'];
  if (key !== config.formsApiKey) {
    return next(ApiError.unauthorized('Invalid or missing forms API key'));
  }
  return next();
}
