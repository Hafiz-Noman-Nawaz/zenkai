// Main Router aggregating all route modules
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const animeRoutes = require('./animeRoutes');
const userAnimeRoutes = require('./userAnimeRoutes');
const reviewRoutes = require('./reviewRoutes');
const statsRoutes = require('./statsRoutes');
const listRoutes = require('./listRoutes');
const notificationRoutes = require('./notificationRoutes');

const { getAllGenres } = require('../controllers/animeController');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Zenkai API',
    version: '1.0.0',
  });
});

// Global genre catalog
router.get('/genres', getAllGenres);

// Module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/anime', animeRoutes);
router.use('/my-anime', userAnimeRoutes);
router.use('/reviews', reviewRoutes);
router.use('/statistics', statsRoutes);
router.use('/lists', listRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
