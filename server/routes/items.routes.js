import { Router } from 'express';
import { verifyFirebaseToken, requireUser } from '../middleware/verifyFirebaseToken.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimiter.js';
import { createItemSchema, updateItemSchema } from '../utils/validators.js';
import {
  createItem,
  listItems,
  getItem,
  updateItem,
  deleteItem,
  rematchItem,
  uploadSignature,
} from '../controllers/items.controller.js';

const router = Router();

// Public browse (auth optional — attaches req.user when present for `mine`).
router.get('/', optionalAuth, listItems);
router.get('/upload-signature', verifyFirebaseToken, requireUser, uploadSignature);
router.get('/:id', getItem);

router.post(
  '/',
  verifyFirebaseToken,
  requireUser,
  writeLimiter,
  validate(createItemSchema),
  createItem
);
router.patch(
  '/:id',
  verifyFirebaseToken,
  requireUser,
  validate(updateItemSchema),
  updateItem
);
router.delete('/:id', verifyFirebaseToken, requireUser, deleteItem);
router.post('/:id/rematch', verifyFirebaseToken, requireUser, writeLimiter, rematchItem);

/**
 * Optional-auth wrapper: if an auth header/dev header is present, verify and
 * attach req.user; otherwise continue anonymously.
 */
function optionalAuth(req, res, next) {
  const hasAuth =
    req.headers.authorization || req.headers['x-dev-uid'];
  if (!hasAuth) return next();
  return verifyFirebaseToken(req, res, () => next());
}

export default router;
