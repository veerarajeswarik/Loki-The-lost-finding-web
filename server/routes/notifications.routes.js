import { Router } from 'express';
import { verifyFirebaseToken, requireUser } from '../middleware/verifyFirebaseToken.js';
import { validate } from '../middleware/validate.js';
import { fcmTokenSchema } from '../utils/validators.js';
import {
  listNotifications,
  markRead,
  markAllRead,
  saveToken,
} from '../controllers/notifications.controller.js';

const router = Router();

router.use(verifyFirebaseToken, requireUser);

router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.post('/token', validate(fcmTokenSchema), saveToken);

export default router;
