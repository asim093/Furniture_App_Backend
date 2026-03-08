import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password required' });
    }
    const user = await User.findOne({ name: name.trim() }).select('+password').populate('workerId');
    if (!user) return res.status(401).json({ message: 'Invalid name or password' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid name or password' });
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    const u = user.toObject();
    delete u.password;
    res.json({ token, user: u });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
