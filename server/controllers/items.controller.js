import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, ApiError } from '../utils/apiResponse.js';
import { Item } from '../models/Item.js';
import { Match } from '../models/Match.js';
import { runMatching } from '../services/match.engine.js';
import { summarizeItem } from '../services/gemini.service.js';
import { getUploadSignature, deleteImage } from '../services/cloudinary.service.js';

const PUBLIC_SELECT = '-privateDetails';

/**
 * GET /api/items/upload-signature — signed params for a direct Cloudinary upload.
 */
export const uploadSignature = asyncHandler(async (req, res) => {
  ok(res, getUploadSignature());
});

/**
 * POST /api/items
 */
export const createItem = asyncHandler(async (req, res) => {
  const b = req.body;
  const item = await Item.create({
    ...b,
    reportedBy: req.user._id,
  });

  // Best-effort AI summary (never blocks the response on failure).
  try {
    item.aiSummary = await summarizeItem(item);
    await item.save();
  } catch (err) {
    console.error('[Items] summarize failed:', err.message);
  }

  // Kick off matching; failures are swallowed inside runMatching.
  let matchInfo = { created: 0 };
  try {
    matchInfo = await runMatching(item);
  } catch (err) {
    console.error('[Items] matching failed:', err.message);
  }

  const safe = item.toObject();
  delete safe.privateDetails;
  created(res, { item: safe, matchesCreated: matchInfo.created });
});

/**
 * GET /api/items — filters, search, pagination.
 * query: type, category, status, q, location, dateFrom, dateTo, page, limit, mine
 */
export const listItems = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    status,
    q,
    location,
    dateFrom,
    dateTo,
    mine,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (location) filter['location.name'] = { $regex: location, $options: 'i' };
  if (mine === 'true' && req.user) filter.reportedBy = req.user._id;

  if (dateFrom || dateTo) {
    filter.dateLostOrFound = {};
    if (dateFrom) filter.dateLostOrFound.$gte = new Date(dateFrom);
    if (dateTo) filter.dateLostOrFound.$lte = new Date(dateTo);
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { 'location.name': { $regex: q, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const perPage = Math.min(50, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Item.find(filter)
      .select(PUBLIC_SELECT)
      .populate('reportedBy', 'name avatarUrl role department')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
    Item.countDocuments(filter),
  ]);

  ok(res, {
    items,
    pagination: {
      page: pageNum,
      limit: perPage,
      total,
      pages: Math.ceil(total / perPage),
    },
  });
});

/**
 * GET /api/items/:id
 */
export const getItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .select(PUBLIC_SELECT)
    .populate('reportedBy', 'name avatarUrl role department');
  if (!item) throw new ApiError('Item not found', 404);
  ok(res, item);
});

/**
 * PATCH /api/items/:id — owner or admin/security only.
 */
export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).select('+privateDetails');
  if (!item) throw new ApiError('Item not found', 404);

  const isOwner = String(item.reportedBy) === String(req.user._id);
  const isPrivileged = ['admin', 'security'].includes(req.user.role);
  if (!isOwner && !isPrivileged) throw new ApiError('Forbidden', 403);

  Object.assign(item, req.body);
  await item.save();

  const safe = item.toObject();
  delete safe.privateDetails;
  ok(res, safe);
});

/**
 * DELETE /api/items/:id — owner or admin only.
 */
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new ApiError('Item not found', 404);

  const isOwner = String(item.reportedBy) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError('Forbidden', 403);

  // Clean up Cloudinary images best-effort.
  await Promise.all((item.images || []).map((img) => deleteImage(img.publicId)));
  await Match.deleteMany({ $or: [{ lostItem: item._id }, { foundItem: item._id }] });
  await item.deleteOne();

  ok(res, { deleted: true });
});

/**
 * POST /api/items/:id/rematch — manually re-run matching for an item.
 */
export const rematchItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).select('+privateDetails');
  if (!item) throw new ApiError('Item not found', 404);

  const isOwner = String(item.reportedBy) === String(req.user._id);
  const isPrivileged = ['admin', 'security'].includes(req.user.role);
  if (!isOwner && !isPrivileged) throw new ApiError('Forbidden', 403);

  const result = await runMatching(item);
  ok(res, { matchesCreated: result.created });
});
