import express from 'express';
import { Week } from '../models/Week.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const weeks = await Week.find().sort({ startDate: -1 });
    res.json(weeks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate, label } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ message: 'Start and end date required' });
    const week = await Week.create({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      label: label?.trim() || '',
    });
    res.status(201).json(week);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const week = await Week.findById(req.params.id);
    if (!week) return res.status(404).json({ message: 'Week not found' });
    res.json(week);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
