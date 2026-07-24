import { Router } from 'express';
import { verifyFirebaseToken, requireUser } from '../middleware/verifyFirebaseToken.js';
import {
  myMatches,
  getMatch,
  acceptMatch,
  rejectMatch,
} from '../controllers/matches.controller.js';

const router = Router();

router.use(verifyFirebaseToken, requireUser);

router.get('/mine', myMatches);
router.get('/:id', getMatch);
router.post('/:id/accept', acceptMatch);
router.post('/:id/reject', rejectMatch);

export default router;
