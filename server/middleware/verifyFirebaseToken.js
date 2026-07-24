import { isConfigured } from '../config/env.js';
import { verifyIdToken } from '../config/firebaseAdmin.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiResponse.js';

/**
 * Auth middleware.
 *
 * Production: expects `Authorization: Bearer <firebaseIdToken>`, verifies via
 * Firebase Admin, and attaches the matching Mongo User to req.user.
 *
 * DEV FALLBACK (Firebase Admin not configured): trusts identity headers
 *   x-dev-uid, x-dev-email, x-dev-name, x-dev-role
 * so the app is fully testable locally without a Firebase project.
 * This is INSECURE and only active when isConfigured('firebase') is false.
 */
export const verifyFirebaseToken = async (req, res, next) => {
  let decoded;

  // ── 1) Resolve identity (auth failures -> 401) ──────────────
  try {
    if (isConfigured('firebase')) {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) throw new ApiError('Missing auth token', 401);
      decoded = await verifyIdToken(token);
    } else {
      const uid = req.headers['x-dev-uid'];
      if (!uid) {
        throw new ApiError('Missing auth (dev mode expects x-dev-uid header)', 401);
      }
      decoded = {
        uid: String(uid),
        email: req.headers['x-dev-email'] || `${uid}@dev.lokii`,
        name: req.headers['x-dev-name'] || 'Dev User',
        picture: '',
        devRole: req.headers['x-dev-role'] || undefined,
      };
    }
  } catch (err) {
    return next(err instanceof ApiError ? err : new ApiError('Unauthorized', 401));
  }

  req.firebaseUser = decoded;

  // ── 2) Attach the Mongo user (DB errors propagate as real errors) ──
  try {
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (user) req.user = user;
    next();
  } catch (err) {
    next(err); // surfaced by errorHandler (e.g. 500/503), not masked as 401
  }
};

/**
 * Requires that a synced Mongo user exists (after verifyFirebaseToken).
 */
export const requireUser = (req, res, next) => {
  if (!req.user) {
    return next(
      new ApiError('User not found — call POST /api/auth/sync first', 401)
    );
  }
  next();
};
