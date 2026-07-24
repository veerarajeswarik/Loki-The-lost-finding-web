import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const NOTIFICATION_TYPES = [
  'match_found',
  'verification_request',
  'verification_result',
  'recovery_complete',
  'reward_earned',
];

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const Notification = model('Notification', notificationSchema);
