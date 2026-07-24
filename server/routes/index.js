import { Router } from 'express';
import authRoutes from './auth.routes.js';
import itemRoutes from './items.routes.js';
import matchRoutes from './matches.routes.js';
import verificationRoutes from './verification.routes.js';
import notificationRoutes from './notifications.routes.js';
import rewardRoutes from './rewards.routes.js';
import userRoutes from './users.routes.js';
import adminRoutes from './admin.routes.js';
import { isConfigured } from '../config/env.js';
import { isDbConnected } from '../config/db.js';
import { dbGuard } from '../middleware/dbGuard.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      db: isDbConnected(),
      services: {
        firebase: isConfigured('firebase'),
        gemini: isConfigured('gemini'),
        cloudinary: isConfigured('cloudinary'),
      },
      devAuthMode: !isConfigured('firebase'),
    },
    error: null,
  });
});

// All data routes require a live DB connection.
router.use(dbGuard);

router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/matches', matchRoutes);
router.use('/verifications', verificationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/rewards', rewardRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
