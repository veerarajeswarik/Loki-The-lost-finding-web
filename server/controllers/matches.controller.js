import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, ApiError } from '../utils/apiResponse.js';
import { Match } from '../models/Match.js';
import { Item } from '../models/Item.js';
import { VerificationRequest } from '../models/VerificationRequest.js';

/**
 * Load a match and confirm the requesting user is a party to it (lost owner,
 * found owner) or privileged. Returns { match, lostItem, foundItem, role }.
 */
async function loadMatchForUser(matchId, user, { withPrivate = false } = {}) {
  const match = await Match.findById(matchId);
  if (!match) throw new ApiError('Match not found', 404);

  const lostQuery = Item.findById(match.lostItem).populate(
    'reportedBy',
    'name avatarUrl role email phone department'
  );
  const foundQuery = Item.findById(match.foundItem).populate(
    'reportedBy',
    'name avatarUrl role email phone department'
  );
  if (withPrivate) foundQuery.select('+privateDetails');

  const [lostItem, foundItem] = await Promise.all([lostQuery, foundQuery]);
  if (!lostItem || !foundItem) throw new ApiError('Match items missing', 404);

  const isLostOwner = String(lostItem.reportedBy._id) === String(user._id);
  const isFoundOwner = String(foundItem.reportedBy._id) === String(user._id);
  const isPrivileged = ['admin', 'security'].includes(user.role);
  if (!isLostOwner && !isFoundOwner && !isPrivileged) {
    throw new ApiError('Forbidden: not a party to this match', 403);
  }

  return {
    match,
    lostItem,
    foundItem,
    isLostOwner,
    isFoundOwner,
    isPrivileged,
  };
}

export { loadMatchForUser };

/**
 * GET /api/matches/mine — matches involving the user's items.
 */
export const myMatches = asyncHandler(async (req, res) => {
  const myItems = await Item.find({ reportedBy: req.user._id }).select('_id');
  const ids = myItems.map((i) => i._id);

  const matches = await Match.find({
    $or: [{ lostItem: { $in: ids } }, { foundItem: { $in: ids } }],
  })
    .populate({ path: 'lostItem', select: '-privateDetails', populate: { path: 'reportedBy', select: 'name avatarUrl' } })
    .populate({ path: 'foundItem', select: '-privateDetails', populate: { path: 'reportedBy', select: 'name avatarUrl' } })
    .sort({ createdAt: -1 });

  ok(res, matches);
});

/**
 * GET /api/matches/:id
 * Contact details are only revealed once the match is completed.
 */
export const getMatch = asyncHandler(async (req, res) => {
  const { match, lostItem, foundItem, isLostOwner, isFoundOwner, isPrivileged } =
    await loadMatchForUser(req.params.id, req.user);

  const revealContact = match.status === 'completed';

  // Latest verification for this match (for claimant progress / finder review).
  const verification = await VerificationRequest.findOne({ match: match._id })
    .sort({ createdAt: -1 })
    .lean();
  const strip = (item) => {
    const obj = item.toObject();
    delete obj.privateDetails;
    if (!revealContact && obj.reportedBy) {
      delete obj.reportedBy.email;
      delete obj.reportedBy.phone;
    }
    return obj;
  };

  ok(res, {
    match,
    lostItem: strip(lostItem),
    foundItem: strip(foundItem),
    contactRevealed: revealContact,
    viewer: { isLostOwner, isFoundOwner, isPrivileged },
    verification: verification
      ? {
          id: verification._id,
          status: verification.status,
          aiScore: verification.aiScore,
          aiFeedback: verification.aiFeedback,
          questions: verification.questions,
          answers:
            isFoundOwner || isPrivileged || isLostOwner ? verification.answers : [],
        }
      : null,
  });
});

/**
 * POST /api/matches/:id/accept — the lost-item owner claims the found item.
 */
export const acceptMatch = asyncHandler(async (req, res) => {
  const { match, isLostOwner } = await loadMatchForUser(req.params.id, req.user);
  if (!isLostOwner) {
    throw new ApiError('Only the person who lost the item can claim it', 403);
  }
  if (!['suggested', 'accepted'].includes(match.status)) {
    throw new ApiError(`Match cannot be accepted from status "${match.status}"`, 400);
  }

  match.status = 'accepted';
  match.acceptedBy = req.user._id;
  await match.save();

  ok(res, match);
});

/**
 * POST /api/matches/:id/reject — either party dismisses the suggestion.
 */
export const rejectMatch = asyncHandler(async (req, res) => {
  const { match, lostItem, foundItem } = await loadMatchForUser(
    req.params.id,
    req.user
  );
  if (['completed', 'verified'].includes(match.status)) {
    throw new ApiError('Cannot reject a completed match', 400);
  }

  match.status = 'rejected';
  await match.save();

  // Reopen items if they have no other active matches.
  for (const item of [lostItem, foundItem]) {
     
    const active = await Match.countDocuments({
      $or: [{ lostItem: item._id }, { foundItem: item._id }],
      status: { $in: ['suggested', 'accepted', 'verified'] },
    });
    if (active === 0 && item.status === 'matched') {
      item.status = 'open';
       
      await item.save();
    }
  }

  ok(res, match);
});
