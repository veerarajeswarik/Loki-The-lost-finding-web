import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const USER_ROLES = ['student', 'faculty', 'staff', 'security', 'admin'];

const statsSchema = new Schema(
  {
    itemsReturned: { type: Number, default: 0 }, // found items successfully handed back
    itemsRecovered: { type: Number, default: 0 }, // own lost items recovered
    trustScore: { type: Number, default: 50 }, // 0-100
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: USER_ROLES, default: 'student', index: true },
    department: { type: String, default: '' },
    phone: { type: String, default: '' },
    fcmTokens: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    stats: { type: statsSchema, default: () => ({}) },
    leaderboardOptOut: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = model('User', userSchema);
