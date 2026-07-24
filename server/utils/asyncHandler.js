/**
 * Wraps an async route handler so rejected promises flow to the error handler
 * instead of crashing the process.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
