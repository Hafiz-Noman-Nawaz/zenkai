// Express Application Configuration
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const apiRouter = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Robust Cross-Origin Resource Sharing (CORS) & Preflight Handler
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-CSRF-Token, X-Api-Version'
  );

  // Immediately respond to preflight OPTIONS requests with 204 No Content
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// HTTP Request Logger (disabled in test)
if (!env.isTest) {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Base Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Zenkai API — Personal Anime Tracking & Discovery Platform',
    docs: '/api/health',
    version: '1.0.0',
  });
});

// API Routes (Mounted on both /api and /api/v1 for convenience)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// 404 Route Not Found
app.use(notFoundHandler);

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
