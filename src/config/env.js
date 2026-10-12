import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import Joi from 'joi';

const VALID_ENVS = ['development', 'uat', 'production', 'test'];
const NODE_ENV = VALID_ENVS.includes(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';

// Load the environment-specific file first (.env.development / .env.uat /
// .env.production), then fall back to a plain .env for anything not
// overridden per-environment. Earlier calls win, so env-specific values
// take priority over the generic .env file.
const envFile = path.resolve(process.cwd(), `.env.${NODE_ENV}`);
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else if (NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.warn(`[config] No ${path.basename(envFile)} found — falling back to .env / process.env`);
}
dotenv.config(); // does not override vars already set above

// Fail fast: validate everything the app depends on, once, at startup,
// instead of discovering a missing var deep in a request handler.
const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...VALID_ENVS)
    .default('development'),
  PORT: Joi.number().integer().default(5000),

  MONGO_URI: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  CORS_ORIGINS: Joi.string().allow('').default(''),

  UPLOAD_DIR: Joi.string().default('uploads'),
  MAX_UPLOAD_MB: Joi.number().default(15),

  FORMS_API_KEY: Joi.string().min(8).required(),

  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent').default('info'),
  LOG_DIR: Joi.string().default('logs'),
  LOG_TO_FILE: Joi.boolean().default(false),
  LOG_RETENTION_DAYS: Joi.number().integer().min(1).default(14),

  API_VERSION: Joi.string()
    .pattern(/^v\d+$/)
    .default('v1'),

  RATE_LIMIT_WINDOW_MINUTES: Joi.number().default(15),
  RATE_LIMIT_MAX: Joi.number().default(100),
  FORMS_RATE_LIMIT_MAX: Joi.number().default(30),
  AUTH_RATE_LIMIT_WINDOW_MINUTES: Joi.number().default(15),
  AUTH_RATE_LIMIT_MAX: Joi.number().default(5),

  SEED_ADMIN_USERNAME: Joi.string().default('admin'),
  SEED_ADMIN_PASSWORD: Joi.string().default('ChangeMe123!'),
  SEED_ADMIN_NAME: Joi.string().default('Administrator'),

  SMTP_HOST: Joi.string().allow('').default(''),
  SMTP_PORT: Joi.number().integer().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  SMTP_FROM: Joi.string().allow('').default(''),
  PASSWORD_RESET_OTP_EXPIRY_MINUTES: Joi.number().integer().min(5).max(60).default(10),
}).unknown(true);

const { value: vars, error } = schema.validate(process.env);
if (error) {
  // eslint-disable-next-line no-console
  console.error(`[config] Invalid environment configuration: ${error.message}`);
  process.exit(1);
}

const env = vars.NODE_ENV;

const config = {
  env,
  isDev: env === 'development',
  isUat: env === 'uat',
  isProd: env === 'production',
  isTest: env === 'test',

  port: vars.PORT,

  mongoUri: vars.MONGO_URI,

  jwtSecret: vars.JWT_SECRET,
  jwtExpiresIn: vars.JWT_EXPIRES_IN,

  corsOrigins: vars.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  uploadDir: vars.UPLOAD_DIR,
  maxUploadBytes: vars.MAX_UPLOAD_MB * 1024 * 1024,

  formsApiKey: vars.FORMS_API_KEY,

  logLevel: vars.LOG_LEVEL,
  logDir: vars.LOG_DIR,
  logToFile: vars.LOG_TO_FILE,
  logRetentionDays: vars.LOG_RETENTION_DAYS,

  apiVersion: vars.API_VERSION,

  rateLimit: {
    windowMs: vars.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    max: vars.RATE_LIMIT_MAX,
    formsMax: vars.FORMS_RATE_LIMIT_MAX,
    authWindowMs: vars.AUTH_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    authMax: vars.AUTH_RATE_LIMIT_MAX,
  },

  seedAdmin: {
    username: vars.SEED_ADMIN_USERNAME,
    password: vars.SEED_ADMIN_PASSWORD,
    name: vars.SEED_ADMIN_NAME,
  },

  smtp: {
    host: vars.SMTP_HOST,
    port: vars.SMTP_PORT,
    secure: vars.SMTP_SECURE,
    user: vars.SMTP_USER,
    pass: vars.SMTP_PASS,
    from: vars.SMTP_FROM || vars.SMTP_USER || 'noreply@yesen.com',
  },

  passwordReset: {
    otpExpiryMinutes: vars.PASSWORD_RESET_OTP_EXPIRY_MINUTES,
  },
};

export default config;
