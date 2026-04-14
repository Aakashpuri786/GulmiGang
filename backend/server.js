const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { initSocket } = require('./socket');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:5178',
  'http://127.0.0.1:5178',
  ...configuredOrigins
]);
initSocket(httpServer, allowedOrigins);

// Middleware Configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Health check endpoint - Critical for Docker health checks
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  const status = mongoose.connection.readyState === 1 ? 200 : 503;
  res.status(status).json(health);
});

// MongoDB Connection with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB Connected Successfully');
      console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
      return;
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB Connection Attempt ${retries}/${maxRetries} Failed:`, error.message);
      
      if (retries < maxRetries) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('❌ Max retries reached. Exiting...');
        process.exit(1);
      }
    }
  }
};

// Initialize database connection
connectDB();

// Monitor MongoDB connection
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
app.get('/', (req, res) => { 
  res.json({ 
    message: 'Welcome to GulmiGang API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      posts: '/api/posts',
      stories: '/api/stories'
    }
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/stories', require('./routes/stories'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5007;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ===================================');
  console.log(`🚀 GulmiGang Backend Server Running`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log('🚀 ===================================');
  console.log('');
});
