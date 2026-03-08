import { connectDB } from './config/db.js';
import app from './app.js';

await connectDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on http://0.0.0.0:${PORT} (LAN: use your PC IP)`)
);
