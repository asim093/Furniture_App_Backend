import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    if (err.message && err.message.includes('bad auth')) {
      console.error(
        'MongoDB connection error: Invalid username or password. Check Atlas → Database Access → your user and password in .env (MONGODB_URI).'
      );
    } else {
      console.error('MongoDB connection error:', err.message);
    }
    if (!process.env.VERCEL) process.exit(1);
    throw err;
  }
}
