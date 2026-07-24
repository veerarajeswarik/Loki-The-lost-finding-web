import { Router } from 'express';
import { verifyFirebaseToken, requireUser } from '../middleware/verifyFirebaseToken.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../utils/validators.js';
import { updateMe, mySummary } from '../controllers/users.controller.js';

const router = Router();

router.use(verifyFirebaseToken, requireUser);

router.patch('/me', validate(updateProfileSchema), updateMe);
router.get('/me/summary', mySummary);

export default router;
