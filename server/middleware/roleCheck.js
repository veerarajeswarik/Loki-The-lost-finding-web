import { ApiError } from '../utils/apiResponse.js';

/**
 * Restrict a route to the given roles. Use after verifyFirebaseToken +
 * requireUser so req.user is populated.
 *
 *   router.get('/admin', verifyFirebaseToken, requireUser, roleCheck('admin','security'), handler)
 */
export const roleCheck =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(new ApiError('Unauthorized', 401));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('Forbidden: insufficient role', 403));
    }
    next();
  };
