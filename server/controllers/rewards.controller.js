import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, ApiError } from '../utils/apiResponse.js';
import { Reward } from '../models/Reward.js';
import { User } from '../models/User.js';

/**
 * GET /api/rewards/mine
 */
export const myRewards = asyncHandler(async (req, res) => {
  const rewards = await Reward.find({ user: req.user._id })
    .populate('triggeredByMatch', 'aiConfidenceScore createdAt')
    .sort({ createdAt: -1 });
  ok(res, rewards);
});

/**
 * PATCH /api/rewards/:id/ack
 */
export const ackReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { acknowledged: true } },
    { new: true }
  );
  if (!reward) throw new ApiError('Reward not found', 404);
  ok(res, reward);
});

/**
 * GET /api/rewards/leaderboard — top honest finders (opt-out respected).
 */
export const leaderboard = asyncHandler(async (req, res) => {
  const users = await User.find({
    leaderboardOptOut: { $ne: true },
    'stats.itemsReturned': { $gt: 0 },
  })
    .select('name avatarUrl department role stats')
    .sort({ 'stats.itemsReturned': -1, 'stats.trustScore': -1 })
    .limit(20);
  ok(res, users);
});
