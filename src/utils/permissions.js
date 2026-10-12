import { ADMIN_DEFAULT_PERMISSIONS, PERMISSIONS } from '../config/permissions.js';

function normalizeList(permissions) {
  return Array.isArray(permissions) ? permissions.filter(Boolean) : [];
}

/** Effective permission keys for a user document (admin role gets full access). */
export function getUserPermissions(user) {
  if (!user) return [];
  if (user.role === 'admin') {
    const explicit = normalizeList(user.permissions);
    return explicit.length ? explicit : ADMIN_DEFAULT_PERMISSIONS;
  }
  return normalizeList(user.permissions);
}

export function hasPermission(user, permission) {
  if (!user || !permission) return false;
  if (user.role === 'admin') return true;

  const granted = getUserPermissions(user);
  if (granted.includes(permission)) return true;

  // Control includes read for the pipeline module.
  if (permission === PERMISSIONS.PIPELINE_READ && granted.includes(PERMISSIONS.PIPELINE_CONTROL)) {
    return true;
  }

  return false;
}

export function hasEveryPermission(user, permissions) {
  return permissions.every((permission) => hasPermission(user, permission));
}

export function hasAnyPermission(user, permissions) {
  return permissions.some((permission) => hasPermission(user, permission));
}

export function serializeUser(user) {
  if (!user) return null;
  const json = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  return {
    ...json,
    effectivePermissions: getUserPermissions(user),
  };
}
