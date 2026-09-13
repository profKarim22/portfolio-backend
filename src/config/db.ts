import mongoose from 'mongoose';

let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  // If already connected, reuse connection immediately
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If a connection is already in progress, await it
  if (!cachedPromise) {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const opts: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000, // Fail after 5s instead of hanging indefinitely
    };

    cachedPromise = mongoose.connect(uri, opts)
      .then((m) => {
        console.log(`MongoDB Connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        cachedPromise = null;
        console.error(`Error connecting to MongoDB: ${(err as Error).message}`);
        throw err;
      });
  }

  try {
    await cachedPromise;
  } catch (error) {
    cachedPromise = null;
    throw error;
  }
};

