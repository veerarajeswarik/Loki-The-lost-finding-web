import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { User, USER_ROLES } from '../models/User.js';

/**
 * POST /api/auth/sync
 * Create or update the Mongo User from the verified Firebase identity.
 */
export const syncUser = asyncHandler(async (req, res) => {
  const fb = req.firebaseUser;
  const body = req.body || {};

  // A "real" name/avatar only when explicitly provided — never clobber a
  // user's saved profile with a placeholder on re-login.
  const providedName =
    body.name || (fb.name && fb.name !== 'Dev User' ? fb.name : '');
  const email = (body.email || fb.email || `${fb.uid}@unknown.lokii`).toLowerCase();
  const avatarUrl = body.avatarUrl || fb.picture || '';

  // Dev-mode role override (only meaningful when Firebase Admin is off).
  const devRole =
    fb.devRole && USER_ROLES.includes(fb.devRole) ? fb.devRole : undefined;

  const set = {
    email,
    ...(providedName ? { name: providedName } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
    ...(body.department ? { department: body.department } : {}),
    ...(body.phone ? { phone: body.phone } : {}),
  };

  const setOnInsert = {
    firebaseUid: fb.uid,
    role: devRole || 'student',
    // Fallback name only on first creation, and only when none was provided
    // (avoids a $set/$setOnInsert conflict on the same path).
    ...(providedName ? {} : { name: email.split('@')[0] || 'User' }),
  };

  const user = await User.findOneAndUpdate(
    { firebaseUid: fb.uid },
    { $set: set, $setOnInsert: setOnInsert },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, data: user, error: null });
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  ok(res, req.user);
});
