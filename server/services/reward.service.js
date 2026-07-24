import { Reward } from '../models/Reward.js';
import { generateEducationalRewards } from './gemini.service.js';
import { notify } from './notification.service.js';

/**
 * Generate + persist a personalized educational reward for a finder and
 * notify them. Never throws fatally — returns the Reward or null.
 */
export async function grantReward(user, matchId) {
  const resources = await generateEducationalRewards(user);
  const reward = await Reward.create({
    user: user._id,
    triggeredByMatch: matchId || null,
    resources,
  });

  await notify(user, {
    type: 'reward_earned',
    title: 'You earned a learning reward 🎓',
    body: `Thanks for your honesty! We picked ${resources.length} resources tailored to your interests.`,
    data: { rewardId: reward._id.toString() },
  });

  return reward;
}
