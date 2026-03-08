import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import workersRoutes from './routes/workers.js';
import weeksRoutes from './routes/weeks.js';
import worksheetsRoutes from './routes/worksheets.js';

const app = express();

let dbPromise = null;
app.use(async (req, res, next) => {
  if (!dbPromise) dbPromise = connectDB();
  await dbPromise;
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workers', workersRoutes);
app.use('/api/weeks', weeksRoutes);
app.use('/api/worksheets', worksheetsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Export for Vercel serverless
export default app;
