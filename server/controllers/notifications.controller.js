import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, ApiError } from '../utils/apiResponse.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

/**
 * GET /api/notifications
 */
export const listNotifications = asyncHandler(async (req, res) => {
  const [items, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  ok(res, { items, unread });
});

/**
 * PATCH /api/notifications/:id/read
 */
export const markRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { read: true } },
    { new: true }
  );
  if (!notif) throw new ApiError('Notification not found', 404);
  ok(res, notif);
});

/**
 * PATCH /api/notifications/read-all
 */
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } }
  );
  ok(res, { ok: true });
});

/**
 * POST /api/notifications/token  { token }
 * Store a device FCM token for push delivery.
 */
export const saveToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { fcmTokens: token } }
  );
  ok(res, { saved: true });
});
