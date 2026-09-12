import app from '../src/app';
import { connectDB } from '../src/config/db';

// Initialize the database connection.
// Mongoose buffers operations until the connection is established.
connectDB().catch(console.error);

export default app;
