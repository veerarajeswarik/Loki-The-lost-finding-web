import { Router } from 'express';
import { verifyFirebaseToken, requireUser } from '../middleware/verifyFirebaseToken.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validate.js';
import { adminStatusSchema } from '../utils/validators.js';
import {
  adminListItems,
  adminStats,
  adminSetItemStatus,
  adminPendingVerifications,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(verifyFirebaseToken, requireUser, roleCheck('admin', 'security'));

router.get('/items', adminListItems);
router.get('/stats', adminStats);
router.get('/verifications', adminPendingVerifications);
router.patch('/items/:id/status', validate(adminStatusSchema), adminSetItemStatus);

export default router;
