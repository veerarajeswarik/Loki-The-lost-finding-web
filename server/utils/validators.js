import { z } from 'zod';
import { ITEM_CATEGORIES, ITEM_TYPES } from '../models/Item.js';
import { USER_ROLES } from '../models/User.js';

export const syncSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  department: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  department: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  interests: z.array(z.string().min(1).max(60)).max(20).optional(),
  leaderboardOptOut: z.boolean().optional(),
  role: z.enum(USER_ROLES).optional(),
});

const imageSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().optional().default(''),
});

export const createItemSchema = z.object({
  type: z.enum(ITEM_TYPES),
  title: z.string().min(2).max(140),
  description: z.string().min(5).max(4000),
  category: z.enum(ITEM_CATEGORIES),
  images: z.array(imageSchema).max(4).optional().default([]),
  location: z
    .object({
      name: z.string().max(160).optional().default(''),
      details: z.string().max(400).optional().default(''),
    })
    .optional()
    .default({}),
  dateLostOrFound: z.coerce.date(),
  privateDetails: z.string().max(2000).optional().default(''),
});

export const updateItemSchema = z.object({
  title: z.string().min(2).max(140).optional(),
  description: z.string().min(5).max(4000).optional(),
  category: z.enum(ITEM_CATEGORIES).optional(),
  images: z.array(imageSchema).max(4).optional(),
  location: z
    .object({
      name: z.string().max(160).optional(),
      details: z.string().max(400).optional(),
    })
    .optional(),
  dateLostOrFound: z.coerce.date().optional(),
  privateDetails: z.string().max(2000).optional(),
});

export const answerSchema = z.object({
  answers: z.array(z.string().max(1000)).min(1).max(10),
});

export const reviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
});

export const fcmTokenSchema = z.object({
  token: z.string().min(10),
});

export const adminStatusSchema = z.object({
  status: z.enum([
    'open',
    'matched',
    'pending_verification',
    'recovered',
    'closed',
  ]),
});
