import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables **before anything else**
dotenv.config();

// Import Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import fileRoutes from './routes/files.js';
import analyticsRoutes from './routes/analytics.js';

// Middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

// Verify JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing in environment variables');
  process.exit(1);
} else {
  console.log('✅ JWT_SECRET loaded');
}

// Create uploads folder if not exist
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
  console.log(`📁 Created uploads folder at ${UPLOAD_PATH}`);
}

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Compression & Logs
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Body parsers
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '10mb' }));
app.use(
  express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '10mb' })
);

// Static files
app.use('/uploads', express.static(path.resolve(__dirname, UPLOAD_PATH)));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Excel Analytics API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Routes
app.use('/api/auth', authRoutes);      
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
📡 Port: ${PORT}
🌐 API URL: http://localhost:${PORT}/api
📊 Health Check: http://localhost:${PORT}/api/health
  `);
});

export default app;
