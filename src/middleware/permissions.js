import ApiError from '../utils/ApiError.js';
import { hasEveryPermission, hasAnyPermission } from '../utils/permissions.js';

/** Require all listed permissions (admin role bypasses). */
export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!hasEveryPermission(req.user, permissions)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    return next();
  };
}

/** Require at least one of the listed permissions (admin role bypasses). */
export function requireAnyPermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!hasAnyPermission(req.user, permissions)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    return next();
  };
}
