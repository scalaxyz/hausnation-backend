require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { initFiles, readJSON, writeJSON } = require('./utils/db');

// Initialize database files
initFiles();

// Initialize admin account if not exists
const initAdmin = async () => {
  const admin = readJSON('admin.json');
  
  if (!admin.username || !admin.password) {
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'changethispassword',
      10
    );
    
    writeJSON('admin.json', {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: hashedPassword
    });
    
    console.log('✅ Admin account initialized');
  }
};

initAdmin();

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));

// Handle preflight requests
app.options('*', cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - Different limits for public vs admin
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Much higher limit for admin operations
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes with appropriate rate limiting
app.use('/api/auth', adminLimiter, require('./routes/auth'));
app.use('/api/artists', adminLimiter, require('./routes/artists'));
app.use('/api/releases', adminLimiter, require('./routes/releases'));
app.use('/api/contact', publicLimiter, require('./routes/contact'));

// Health check endpoint (no rate limit)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hausnation API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint (no rate limit)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Hausnation API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      artists: '/api/artists',
      releases: '/api/releases',
      contact: '/api/contact'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║       🎵 HAUSNATION API SERVER 🎵     ║
║                                        ║
║  Status: Running                       ║
║  Port: ${PORT}                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  Rate Limits:                          ║
║    - Public: 100 req/15min             ║
║    - Admin: 500 req/15min              ║
║                                        ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;