import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const MATCH_STATUSES = [
  'suggested',
  'accepted',
  'rejected',
  'verified',
  'completed',
];

const matchSchema = new Schema(
  {
    lostItem: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    foundItem: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    aiConfidenceScore: { type: Number, default: 0 }, // 0-100
    aiReasoning: { type: String, default: '' },
    status: { type: String, enum: MATCH_STATUSES, default: 'suggested', index: true },

    // The user who accepted (claimed) this match — usually the lost-item owner.
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Avoid duplicate suggestions for the same pair.
matchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });

export const Match = model('Match', matchSchema);
