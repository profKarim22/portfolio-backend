import app from '../src/app';
import { connectDB } from '../src/config/db';

export default async function handler(req: any, res: any) {
  try {
    // Ensure database connection completes before passing request to Express (skip for health check)
    const url = req.url || '';
    if (!url.startsWith('/api/health')) {
      await connectDB();
    }
    
    // Pass request and response to the Express app
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Database Connection Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Database connection failed in serverless handler.",
      details: error.message 
    });
  }
}
