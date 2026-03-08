import mongoose from 'mongoose';

const weekSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    label: { type: String, trim: true },
  },
  { timestamps: true }
);

weekSchema.index({ startDate: 1, endDate: 1 });

export const Week = mongoose.model('Week', weekSchema);
