import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, ApiError } from '../utils/apiResponse.js';
import { Match } from '../models/Match.js';
import { Item } from '../models/Item.js';
import { User } from '../models/User.js';
import { VerificationRequest } from '../models/VerificationRequest.js';
import { env } from '../config/env.js';
import {
  generateVerificationQuestions,
  scoreVerificationAnswers,
} from '../services/gemini.service.js';
import { notify } from '../services/notification.service.js';
import { grantReward } from '../services/reward.service.js';
import { loadMatchForUser } from './matches.controller.js';

/**
 * POST /api/verifications  { matchId }
 * The lost-item owner starts ownership verification; Gemini generates
 * questions from the found item's private details.
 */
export const createVerification = asyncHandler(async (req, res) => {
  const { matchId } = req.body;
  if (!matchId) throw new ApiError('matchId is required', 400);

  const { match, foundItem, isLostOwner } = await loadMatchForUser(
    matchId,
    req.user,
    { withPrivate: true }
  );
  if (!isLostOwner) {
    throw new ApiError('Only the claimant can start verification', 403);
  }
  if (!['accepted', 'suggested'].includes(match.status)) {
    throw new ApiError(`Cannot verify from status "${match.status}"`, 400);
  }

  // Reuse an existing pending request if present.
  let request = await VerificationRequest.findOne({
    match: match._id,
    claimant: req.user._id,
    status: 'pending',
  });

  if (!request) {
    const questions = await generateVerificationQuestions(foundItem, 3);
    request = await VerificationRequest.create({
      match: match._id,
      claimant: req.user._id,
      questions,
    });
  }

  match.status = 'accepted';
  if (!match.acceptedBy) match.acceptedBy = req.user._id;
  await match.save();
  await Item.updateMany(
    { _id: { $in: [match.lostItem, match.foundItem] } },
    { $set: { status: 'pending_verification' } }
  );

  created(res, {
    id: request._id,
    questions: request.questions,
    status: request.status,
  });
});

/**
 * POST /api/verifications/:id/answer  { answers: [...] }
 */
export const answerVerification = asyncHandler(async (req, res) => {
  const request = await VerificationRequest.findById(req.params.id);
  if (!request) throw new ApiError('Verification not found', 404);
  if (String(request.claimant) !== String(req.user._id)) {
    throw new ApiError('Only the claimant can answer', 403);
  }
  if (request.status !== 'pending') {
    throw new ApiError('This verification is already resolved', 400);
  }

  const foundItem = await Item.findById(
    (await Match.findById(request.match)).foundItem
  ).select('+privateDetails');
  if (!foundItem) throw new ApiError('Found item missing', 404);

  request.answers = req.body.answers;
  const { score, feedback } = await scoreVerificationAnswers(
    foundItem,
    request.questions,
    request.answers
  );
  request.aiScore = score;
  request.aiFeedback = feedback;

  if (score >= env.verificationThreshold) {
    request.status = 'approved';
    await request.save();
    await completeRecovery(request.match, req.user);
    return ok(res, {
      status: 'approved',
      score,
      feedback,
      message: 'Ownership verified! Contact details are now shared.',
    });
  }

  // Below threshold → route to finder / security for manual review.
  await request.save();
  const foundOwner = await User.findById(foundItem.reportedBy);
  if (foundOwner) {
    await notify(foundOwner, {
      type: 'verification_request',
      title: 'Manual verification needed',
      body: `A claimant answered verification questions for your found "${foundItem.title}" (AI score ${score}%). Please review.`,
      data: { verificationId: request._id.toString(), matchId: request.match.toString() },
    });
  }

  ok(res, {
    status: 'pending',
    score,
    feedback,
    message: 'Answers submitted. Awaiting manual review by the finder.',
  });
});

/**
 * POST /api/verifications/:id/review  { decision: 'approved'|'rejected' }
 * Finder (found-item owner) or security/admin makes the final call.
 */
export const reviewVerification = asyncHandler(async (req, res) => {
  const request = await VerificationRequest.findById(req.params.id);
  if (!request) throw new ApiError('Verification not found', 404);
  if (request.status !== 'pending') {
    throw new ApiError('Already resolved', 400);
  }

  const match = await Match.findById(request.match);
  if (!match) throw new ApiError('Match missing', 404);
  const foundItem = await Item.findById(match.foundItem);

  const isFinder = String(foundItem.reportedBy) === String(req.user._id);
  const isPrivileged = ['admin', 'security'].includes(req.user.role);
  if (!isFinder && !isPrivileged) throw new ApiError('Forbidden', 403);

  request.reviewedBy = req.user._id;
  request.status = req.body.decision;
  await request.save();

  const claimant = await User.findById(request.claimant);

  if (req.body.decision === 'approved') {
    await completeRecovery(request.match, claimant);
    if (claimant) {
      await notify(claimant, {
        type: 'verification_result',
        title: 'Ownership approved ✅',
        body: 'Your claim was approved. Contact details are now shared to arrange handover.',
        data: { matchId: match._id.toString() },
      });
    }
    return ok(res, { status: 'approved' });
  }

  // Rejected: reopen items.
  match.status = 'rejected';
  await match.save();
  await Item.updateMany(
    { _id: { $in: [match.lostItem, match.foundItem] } },
    { $set: { status: 'open' } }
  );
  if (claimant) {
    await notify(claimant, {
      type: 'verification_result',
      title: 'Ownership not verified',
      body: 'Your claim could not be verified. If this is a mistake, contact campus security.',
      data: { matchId: match._id.toString() },
    });
  }
  ok(res, { status: 'rejected' });
});

/**
 * GET /api/verifications/:id
 */
export const getVerification = asyncHandler(async (req, res) => {
  const request = await VerificationRequest.findById(req.params.id);
  if (!request) throw new ApiError('Verification not found', 404);

  const match = await Match.findById(request.match);
  const foundItem = await Item.findById(match.foundItem);
  const isClaimant = String(request.claimant) === String(req.user._id);
  const isFinder = String(foundItem.reportedBy) === String(req.user._id);
  const isPrivileged = ['admin', 'security'].includes(req.user.role);
  if (!isClaimant && !isFinder && !isPrivileged) {
    throw new ApiError('Forbidden', 403);
  }

  // Never expose stored answers to the finder in raw form beyond review needs;
  // for simplicity we return questions/status always and answers to reviewers.
  const data = {
    id: request._id,
    match: request.match,
    questions: request.questions,
    status: request.status,
    aiScore: request.aiScore,
    aiFeedback: request.aiFeedback,
    answers: isClaimant || isFinder || isPrivileged ? request.answers : [],
  };
  ok(res, data);
});

/**
 * Shared: finalize a successful recovery — complete match, mark items
 * recovered, bump both parties' stats, and grant the finder a reward.
 */
async function completeRecovery(matchId, claimant) {
  const match = await Match.findById(matchId);
  if (!match) return;
  match.status = 'completed';
  await match.save();

  const [lostItem, foundItem] = await Promise.all([
    Item.findById(match.lostItem),
    Item.findById(match.foundItem),
  ]);
  if (lostItem) {
    lostItem.status = 'recovered';
    await lostItem.save();
  }
  if (foundItem) {
    foundItem.status = 'recovered';
    await foundItem.save();
  }

  const finder = foundItem ? await User.findById(foundItem.reportedBy) : null;
  const owner = claimant || (lostItem ? await User.findById(lostItem.reportedBy) : null);

  // Update stats + trust score.
  if (finder) {
    finder.stats.itemsReturned += 1;
    finder.stats.trustScore = Math.min(100, finder.stats.trustScore + 5);
    await finder.save();
  }
  if (owner) {
    owner.stats.itemsRecovered += 1;
    await owner.save();
  }

  // Notify recovery to both parties.
  const recoveryPayload = {
    type: 'recovery_complete',
    title: 'Item recovered 🎉',
    data: { matchId: match._id.toString() },
  };
  if (owner) {
    await notify(owner, {
      ...recoveryPayload,
      body: `Great news — your "${lostItem?.title}" has been verified and recovered.`,
    });
  }
  if (finder) {
    await notify(finder, {
      ...recoveryPayload,
      body: `Thank you for returning "${foundItem?.title}"! A reward is on its way.`,
    });
    // Grant educational reward to the finder (honest returner).
    try {
      await grantReward(finder, match._id);
    } catch (err) {
      console.error('[Verification] reward grant failed:', err.message);
    }
  }
}
