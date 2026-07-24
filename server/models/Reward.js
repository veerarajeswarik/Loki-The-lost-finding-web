import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const RESOURCE_TYPES = [
  'roadmap',
  'interview-prep',
  'cheatsheet',
  'docs',
  'career',
];

const resourceSchema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: RESOURCE_TYPES, default: 'docs' },
    url: { type: String, default: '' },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const rewardSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    triggeredByMatch: { type: Schema.Types.ObjectId, ref: 'Match', default: null },
    resources: { type: [resourceSchema], default: [] },
    acknowledged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Reward = model('Reward', rewardSchema);
