import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const VERIFICATION_STATUSES = ['pending', 'approved', 'rejected'];

const verificationSchema = new Schema(
  {
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
    claimant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Gemini-generated questions derived from the found item's private details.
    questions: { type: [String], default: [] },
    answers: { type: [String], default: [] },

    aiScore: { type: Number, default: null }, // 0-100 similarity of answers
    aiFeedback: { type: String, default: '' },

    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export const VerificationRequest = model(
  'VerificationRequest',
  verificationSchema
);
