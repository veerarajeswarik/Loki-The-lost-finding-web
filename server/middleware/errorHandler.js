import { ZodError } from 'zod';
import { ApiError } from '../utils/apiResponse.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      data: null,
      error: {
        message: 'Validation failed',
        issues: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      data: null,
      error: { message: err.message, details: err.details },
    });
  }

  // Mongoose cast/validation
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      data: null,
      error: { message: `Invalid ${err.path}: ${err.value}` },
    });
  }

  console.error('[UnhandledError]', err);
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    data: null,
    error: {
      message:
        status === 500 ? 'Internal server error' : err.message || 'Error',
    },
  });
}

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    data: null,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
}
