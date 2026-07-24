import { Router } from 'express';
import { verifyFirebaseToken, requireUser } from '../middleware/verifyFirebaseToken.js';
import { validate } from '../middleware/validate.js';
import { answerSchema, reviewSchema } from '../utils/validators.js';
import {
  createVerification,
  answerVerification,
  reviewVerification,
  getVerification,
} from '../controllers/verification.controller.js';

const router = Router();

router.use(verifyFirebaseToken, requireUser);

router.post('/', createVerification);
router.get('/:id', getVerification);
router.post('/:id/answer', validate(answerSchema), answerVerification);
router.post('/:id/review', validate(reviewSchema), reviewVerification);

export default router;
