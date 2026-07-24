import { Router } from 'express';
import { verifyFirebaseToken, requireUser } from '../middleware/verifyFirebaseToken.js';
import {
  myRewards,
  ackReward,
  leaderboard,
} from '../controllers/rewards.controller.js';

const router = Router();

// Leaderboard is public.
router.get('/leaderboard', leaderboard);

router.use(verifyFirebaseToken, requireUser);
router.get('/mine', myRewards);
router.patch('/:id/ack', ackReward);

export default router;
