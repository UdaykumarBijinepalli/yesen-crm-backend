// Granular API permissions for the admin panel.
// `pipeline.control` implies `pipeline.read` (see hasPermission).

export const PERMISSIONS = {
  PIPELINE_READ: 'pipeline.read',
  PIPELINE_CONTROL: 'pipeline.control',
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_READ: 'projects.read',
  PROJECTS_UPDATE: 'projects.update',
  PROJECTS_DELETE: 'projects.delete',
  TESTIMONIALS_CREATE: 'testimonials.create',
  TESTIMONIALS_READ: 'testimonials.read',
  TESTIMONIALS_UPDATE: 'testimonials.update',
  TESTIMONIALS_DELETE: 'testimonials.delete',
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/** Default grants for the legacy `admin` role when no explicit list is stored. */
export const ADMIN_DEFAULT_PERMISSIONS = [...ALL_PERMISSIONS];

/** Permission groups exposed to the admin UI when assigning access. */
export const PERMISSION_GROUPS = [
  {
    module: 'pipeline',
    label: 'Pipeline',
    permissions: [
      { key: PERMISSIONS.PIPELINE_READ, label: 'Read', description: 'View inquiries, board, logs, and documents' },
      {
        key: PERMISSIONS.PIPELINE_CONTROL,
        label: 'Control',
        description: 'Read access plus create, update, move, tag, and delete inquiries',
      },
    ],
  },
  {
    module: 'users',
    label: 'Users',
    permissions: [
      { key: PERMISSIONS.USERS_CREATE, label: 'Create user', description: 'Create new user accounts' },
      { key: PERMISSIONS.USERS_READ, label: 'Read users', description: 'View the users list' },
      { key: PERMISSIONS.USERS_UPDATE, label: 'Update user', description: 'Edit existing user accounts' },
      { key: PERMISSIONS.USERS_DELETE, label: 'Delete user', description: 'Remove user accounts' },
    ],
  },
  {
    module: 'projects',
    label: 'Projects',
    permissions: [
      { key: PERMISSIONS.PROJECTS_CREATE, label: 'Add project', description: 'Create new projects' },
      { key: PERMISSIONS.PROJECTS_READ, label: 'Read projects', description: 'View the projects list' },
      { key: PERMISSIONS.PROJECTS_UPDATE, label: 'Edit project', description: 'Edit existing projects' },
      { key: PERMISSIONS.PROJECTS_DELETE, label: 'Delete project', description: 'Remove projects' },
    ],
  },
  {
    module: 'testimonials',
    label: 'Testimonials',
    permissions: [
      { key: PERMISSIONS.TESTIMONIALS_CREATE, label: 'Add testimonial', description: 'Create new testimonials' },
      { key: PERMISSIONS.TESTIMONIALS_READ, label: 'Read testimonials', description: 'View the testimonials list' },
      { key: PERMISSIONS.TESTIMONIALS_UPDATE, label: 'Edit testimonial', description: 'Edit existing testimonials' },
      { key: PERMISSIONS.TESTIMONIALS_DELETE, label: 'Delete testimonial', description: 'Remove testimonials' },
    ],
  },
];
