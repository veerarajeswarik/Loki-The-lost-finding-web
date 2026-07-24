import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';

/**
 * PATCH /api/users/me — update profile (interests, department, phone, etc.).
 * Note: role changes are ignored here unless the requester is already admin.
 */
export const updateMe = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.role && req.user.role !== 'admin') delete update.role;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: update },
    { new: true }
  );
  ok(res, user);
});

/**
 * GET /api/users/me/summary — dashboard counts for the current user.
 */
export const mySummary = asyncHandler(async (req, res) => {
  const [lost, found, recovered] = await Promise.all([
    Item.countDocuments({ reportedBy: req.user._id, type: 'lost' }),
    Item.countDocuments({ reportedBy: req.user._id, type: 'found' }),
    Item.countDocuments({ reportedBy: req.user._id, status: 'recovered' }),
  ]);
  ok(res, {
    stats: req.user.stats,
    counts: { lost, found, recovered },
    interests: req.user.interests,
  });
});
