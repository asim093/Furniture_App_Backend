import express from 'express';
import { Worker } from '../models/Worker.js';
import { User } from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ name: 1 }).lean();
    const userIds = await User.find({ workerId: { $in: workers.map((w) => w._id) } })
      .select('workerId')
      .lean();
    const hasLoginSet = new Set(userIds.map((u) => u.workerId.toString()));
    const withHasLogin = workers.map((w) => ({ ...w, hasLogin: hasLoginSet.has(w._id.toString()) }));
    res.json(withHasLogin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, previousAdvanceBalance } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name required' });
    const worker = await Worker.create({
      name: name.trim(),
      previousAdvanceBalance: Number(previousAdvanceBalance) || 0,
    });
    res.status(201).json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { name, previousAdvanceBalance } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (previousAdvanceBalance !== undefined) update.previousAdvanceBalance = Number(previousAdvanceBalance);
    const worker = await Worker.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/create-user', async (req, res) => {
  try {
    const { name: loginName, password } = req.body;
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    const existingForWorker = await User.findOne({ workerId: worker._id });
    if (existingForWorker) return res.status(400).json({ message: 'This worker already has a login' });
    if (!loginName?.trim() || !password) return res.status(400).json({ message: 'Login name and password required' });
    const existing = await User.findOne({ name: loginName.trim() });
    if (existing) return res.status(400).json({ message: 'User name already exists' });
    const user = await User.create({
      name: loginName.trim(),
      password,
      role: 'worker',
      workerId: worker._id,
    });
    const u = user.toObject();
    delete u.password;
    res.status(201).json(u);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
