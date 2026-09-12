import mongoose from 'mongoose';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB already connected');
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    // In serverless, we might not want to kill the process immediately, but throw the error
    // to let the request fail gracefully instead of crashing the whole container.
    throw error;
  }
};
