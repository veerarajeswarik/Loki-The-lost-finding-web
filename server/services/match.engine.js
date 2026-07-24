import { Item } from '../models/Item.js';
import { Match } from '../models/Match.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { scoreItemMatch } from './gemini.service.js';
import { notify } from './notification.service.js';

/**
 * Run matching for a single item against candidate items of the opposite type.
 * Creates Match docs above the confidence threshold and notifies both parties
 * for high-confidence matches. Never throws — returns a summary.
 *
 * @param {Object} item  Mongoose Item doc that was just created/updated.
 * @returns {Promise<{created: number, matches: Array}>}
 */
export async function runMatching(item) {
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';

  // Candidate window: same category, still open, within ±30 days.
  const date = new Date(item.dateLostOrFound);
  const from = new Date(date);
  from.setDate(from.getDate() - 30);
  const to = new Date(date);
  to.setDate(to.getDate() + 30);

  const candidates = await Item.find({
    type: oppositeType,
    category: item.category,
    status: { $in: ['open', 'matched'] },
    dateLostOrFound: { $gte: from, $lte: to },
  })
    .select('+privateDetails')
    .limit(25);

  const results = [];
  for (const candidate of candidates) {
    const lostItem = item.type === 'lost' ? item : candidate;
    const foundItem = item.type === 'found' ? item : candidate;

    // Skip if a match already exists for this pair.
     
    const existing = await Match.findOne({
      lostItem: lostItem._id,
      foundItem: foundItem._id,
    });
    if (existing) continue;

    let score;
    try {
       
      score = await scoreItemMatch(lostItem, foundItem);
    } catch (err) {
      console.error('[MatchEngine] scoring failed, skipping:', err.message);
      continue;
    }

    if (score.confidence < env.matchThreshold) continue;

    let match;
    try {
       
      match = await Match.create({
        lostItem: lostItem._id,
        foundItem: foundItem._id,
        aiConfidenceScore: score.confidence,
        aiReasoning: score.reasoning,
        status: 'suggested',
      });
    } catch (err) {
      // Likely duplicate key from a concurrent run — ignore.
      if (err.code !== 11000) {
        console.error('[MatchEngine] match create failed:', err.message);
      }
      continue;
    }

    results.push(match);

    // Mark both items as matched (do not downgrade later statuses).
     
    await Item.updateMany(
      { _id: { $in: [lostItem._id, foundItem._id] }, status: 'open' },
      { $set: { status: 'matched' } }
    );

    // Notify both reporters.
    try {
       
      const [lostOwner, foundOwner] = await Promise.all([
        User.findById(lostItem.reportedBy),
        User.findById(foundItem.reportedBy),
      ]);
      const payload = {
        type: 'match_found',
        title: 'Potential match found 🌿',
        data: { matchId: match._id.toString(), confidence: score.confidence },
      };
      if (lostOwner) {
         
        await notify(lostOwner, {
          ...payload,
          body: `We found a possible match for your lost "${lostItem.title}" (${score.confidence}% confidence).`,
        });
      }
      if (foundOwner) {
         
        await notify(foundOwner, {
          ...payload,
          body: `An item you found may match a lost report (${score.confidence}% confidence).`,
        });
      }
    } catch (err) {
      console.error('[MatchEngine] notify failed:', err.message);
    }
  }

  return { created: results.length, matches: results };
}
