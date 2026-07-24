import { Router } from 'express';
import { verifyFirebaseToken, requireUser } from '../middleware/verifyFirebaseToken.js';
import { validate } from '../middleware/validate.js';
import { syncSchema } from '../utils/validators.js';
import { syncUser, getMe } from '../controllers/auth.controller.js';

const router = Router();

router.post('/sync', verifyFirebaseToken, validate(syncSchema), syncUser);
router.get('/me', verifyFirebaseToken, requireUser, getMe);

export default router;
