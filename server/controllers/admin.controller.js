import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, ApiError } from '../utils/apiResponse.js';
import { Item } from '../models/Item.js';
import { User } from '../models/User.js';
import { Match } from '../models/Match.js';
import { VerificationRequest } from '../models/VerificationRequest.js';

/**
 * GET /api/admin/items — all items (privileged), with optional filters.
 */
export const adminListItems = asyncHandler(async (req, res) => {
  const { type, status, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  const pageNum = Math.max(1, Number(page));
  const perPage = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Item.find(filter)
      .populate('reportedBy', 'name email role department')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
    Item.countDocuments(filter),
  ]);

  ok(res, {
    items,
    pagination: { page: pageNum, limit: perPage, total, pages: Math.ceil(total / perPage) },
  });
});

/**
 * GET /api/admin/stats — platform-wide metrics.
 */
export const adminStats = asyncHandler(async (req, res) => {
  const [
    totalItems,
    lost,
    found,
    recovered,
    pendingVerification,
    users,
    matches,
    completedMatches,
    pendingReviews,
  ] = await Promise.all([
    Item.countDocuments({}),
    Item.countDocuments({ type: 'lost' }),
    Item.countDocuments({ type: 'found' }),
    Item.countDocuments({ status: 'recovered' }),
    Item.countDocuments({ status: 'pending_verification' }),
    User.countDocuments({}),
    Match.countDocuments({}),
    Match.countDocuments({ status: 'completed' }),
    VerificationRequest.countDocuments({ status: 'pending' }),
  ]);

  ok(res, {
    items: { total: totalItems, lost, found, recovered, pendingVerification },
    users,
    matches: { total: matches, completed: completedMatches },
    pendingReviews,
    recoveryRate: totalItems ? Math.round((recovered / totalItems) * 100) : 0,
  });
});

/**
 * PATCH /api/admin/items/:id/status — override an item's status.
 */
export const adminSetItemStatus = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndUpdate(
    req.params.id,
    { $set: { status: req.body.status } },
    { new: true }
  ).select('-privateDetails');
  if (!item) throw new ApiError('Item not found', 404);
  ok(res, item);
});

/**
 * GET /api/admin/verifications — pending manual reviews.
 */
export const adminPendingVerifications = asyncHandler(async (req, res) => {
  const requests = await VerificationRequest.find({ status: 'pending' })
    .populate('claimant', 'name email')
    .populate('match')
    .sort({ createdAt: -1 });
  ok(res, requests);
});
