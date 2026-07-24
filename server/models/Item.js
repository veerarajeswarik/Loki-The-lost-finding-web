import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const ITEM_TYPES = ['lost', 'found'];
export const ITEM_CATEGORIES = [
  'electronics',
  'ID cards',
  'books',
  'accessories',
  'clothing',
  'keys',
  'other',
];
export const ITEM_STATUSES = [
  'open',
  'matched',
  'pending_verification',
  'recovered',
  'closed',
];

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const locationSchema = new Schema(
  {
    name: { type: String, default: '' },
    details: { type: String, default: '' },
  },
  { _id: false }
);

const itemSchema = new Schema(
  {
    type: { type: String, enum: ITEM_TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: ITEM_CATEGORIES, required: true, index: true },
    images: { type: [imageSchema], default: [] },
    location: { type: locationSchema, default: () => ({}) },
    dateLostOrFound: { type: Date, required: true, index: true },
    status: { type: String, enum: ITEM_STATUSES, default: 'open', index: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Verification-only: distinguishing marks known solely to the true owner.
    // NEVER returned in public responses (see toPublicJSON / controller select).
    privateDetails: { type: String, default: '', select: false },

    // AI-generated normalized summary used to seed matching prompts.
    aiSummary: { type: String, default: '' },
  },
  { timestamps: true }
);

// Text index for keyword search across title/description/location.
itemSchema.index({ title: 'text', description: 'text', 'location.name': 'text' });

export const Item = model('Item', itemSchema);
