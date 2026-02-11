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

// CORS configuration - FIXED
app.use(cors({
  origin: true, // Allow all origins
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/artists', require('./routes/artists'));
app.use('/api/releases', require('./routes/releases'));
app.use('/api/contact', require('./routes/contact'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hausnation API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
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
║                                        ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;