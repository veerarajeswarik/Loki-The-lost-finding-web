import { isDbConnected } from '../config/db.js';
import { isConfigured } from '../config/env.js';

/**
 * Short-circuits API requests with a clear 503 when MongoDB is not connected,
 * instead of letting Mongoose buffer commands for 10s and time out.
 * The /health route is exempt (handled before this runs).
 */
export function dbGuard(req, res, next) {
  if (isDbConnected()) return next();
  return res.status(503).json({
    success: false,
    data: null,
    error: {
      message: isConfigured('mongo')
        ? 'Database is connecting or unavailable. Please retry shortly.'
        : 'Database not configured. Set MONGO_URI in server/.env to enable data features.',
    },
  });
}
