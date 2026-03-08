import mongoose from 'mongoose';

const productionItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  pricePerItem: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const extraPayEntrySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  note: { type: String, default: '' },
  addedAt: { type: Date, default: Date.now },
});

const workerSheetSchema = new mongoose.Schema(
  {
    weekId: { type: mongoose.Schema.Types.ObjectId, ref: 'Week', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    items: [productionItemSchema],
    extraPay: [extraPayEntrySchema],
    previousAdvanceBalance: { type: Number, default: 0 },
    advanceThisWeek: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

workerSheetSchema.index({ weekId: 1, workerId: 1 }, { unique: true });

workerSheetSchema.virtual('itemsTotal').get(function () {
  return this.items.reduce((sum, i) => sum + (i.pricePerItem || 0) * (i.quantity || 1), 0);
});

workerSheetSchema.virtual('extraPayTotal').get(function () {
  return this.extraPay.reduce((sum, e) => sum + (e.amount || 0), 0);
});

workerSheetSchema.virtual('netPay').get(function () {
  const itemsTotal = this.items.reduce((sum, i) => sum + (i.pricePerItem || 0) * (i.quantity || 1), 0);
  const extraTotal = this.extraPay.reduce((sum, e) => sum + (e.amount || 0), 0);
  return itemsTotal + extraTotal - (this.advanceThisWeek || 0) - (this.deductions || 0);
});

workerSheetSchema.set('toJSON', { virtuals: true });
workerSheetSchema.set('toObject', { virtuals: true });

export const WorkerSheet = mongoose.model('WorkerSheet', workerSheetSchema);
