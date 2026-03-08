import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    previousAdvanceBalance: { type: Number, default: 0 },
    role: { type: String, enum: ['worker'], default: 'worker' },
  },
  { timestamps: true }
);

export const Worker = mongoose.model('Worker', workerSchema);
