import express from 'express';
import { WorkerSheet } from '../models/WorkerSheet.js';
import { Worker } from '../models/Worker.js';
import { Week } from '../models/Week.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { weekId, workerId } = req.query;
    const filter = {};
    if (weekId) filter.weekId = weekId;
    if (workerId) filter.workerId = workerId;
    if (req.user.role === 'worker' && req.user.workerId) {
      filter.workerId = req.user.workerId._id;
    }
    const sheets = await WorkerSheet.find(filter)
      .populate('weekId')
      .populate('workerId')
      .sort({ createdAt: -1 });
    res.json(sheets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sheet = await WorkerSheet.findById(req.params.id).populate('weekId').populate('workerId');
    if (!sheet) return res.status(404).json({ message: 'Sheet not found' });
    if (req.user.role === 'worker' && String(sheet.workerId._id) !== String(req.user.workerId?._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { weekId, workerId, items, extraPay, previousAdvanceBalance, advanceThisWeek, deductions, note } = req.body;
    if (!weekId || !workerId) return res.status(400).json({ message: 'weekId and workerId required' });
    const existing = await WorkerSheet.findOne({ weekId, workerId });
    if (existing) return res.status(400).json({ message: 'Sheet already exists for this week and worker' });
    const worker = await Worker.findById(workerId);
    const prevAdvance = previousAdvanceBalance !== undefined ? Number(previousAdvanceBalance) : (worker?.previousAdvanceBalance ?? 0);
    const sheet = await WorkerSheet.create({
      weekId,
      workerId,
      items: items || [],
      extraPay: extraPay || [],
      previousAdvanceBalance: prevAdvance,
      advanceThisWeek: Number(advanceThisWeek) || 0,
      deductions: Number(deductions) || 0,
      note: note || '',
    });
    const populated = await WorkerSheet.findById(sheet._id).populate('weekId').populate('workerId');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { items, extraPay, previousAdvanceBalance, advanceThisWeek, deductions, note } = req.body;
    const update = {};
    if (items !== undefined) update.items = items;
    if (extraPay !== undefined) update.extraPay = extraPay;
    if (previousAdvanceBalance !== undefined) update.previousAdvanceBalance = Number(previousAdvanceBalance);
    if (advanceThisWeek !== undefined) update.advanceThisWeek = Number(advanceThisWeek);
    if (deductions !== undefined) update.deductions = Number(deductions);
    if (note !== undefined) update.note = note;
    const sheet = await WorkerSheet.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('weekId')
      .populate('workerId');
    if (!sheet) return res.status(404).json({ message: 'Sheet not found' });
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/extra-pay', requireRole('admin'), async (req, res) => {
  try {
    const { amount, note } = req.body;
    if (amount == null) return res.status(400).json({ message: 'Amount required' });
    const sheet = await WorkerSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: 'Sheet not found' });
    sheet.extraPay.push({ amount: Number(amount), note: note || '' });
    await sheet.save();
    const populated = await WorkerSheet.findById(sheet._id).populate('weekId').populate('workerId');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
