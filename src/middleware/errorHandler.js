import multer from 'multer';
import config from '../config/env.js';
import logger from '../config/logger.js';
import ApiError from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Normalizes any thrown error into an ApiError so downstream logging/
// response formatting only has one shape to deal with.
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  if (err.name === 'ValidationError') return ApiError.badRequest(err.message);
  if (err.name === 'CastError') return ApiError.badRequest(`Invalid id: ${err.value}`);
  if (err.code === 11000) return ApiError.conflict('Duplicate value', err.keyValue);
  if (err instanceof multer.MulterError) return ApiError.badRequest(`Upload error: ${err.message}`);
  // Multer fileFilter sometimes surfaces as a plain Error with our message
  if (typeof err.message === 'string' && err.message.startsWith('Unsupported file type:')) {
    return ApiError.badRequest(err.message);
  }

  // Unknown/unexpected error — treat as non-operational, keep original
  // message out of the response body in production.
  const apiErr = new ApiError(500, config.isProd ? 'Internal server error' : err.message);
  apiErr.isOperational = false;
  apiErr.original = err;
  return apiErr;
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const apiErr = normalizeError(err);

  const logPayload = { err: apiErr.original || err, requestId: req.id, statusCode: apiErr.statusCode };
  if (apiErr.statusCode >= 500) {
    logger.error(logPayload, 'Unhandled error');
  } else {
    logger.warn(logPayload, apiErr.message);
  }

  res.status(apiErr.statusCode).json({
    error: apiErr.message,
    ...(apiErr.details ? { details: apiErr.details } : {}),
    requestId: req.id,
  });
}
