const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/db');

// Get all releases (Public)
router.get('/', (req, res) => {
  try {
    const releases = readJSON('releases.json');
    
    // Sort by release date (newest first)
    const sortedReleases = releases.sort((a, b) => {
      return new Date(b.releaseDate) - new Date(a.releaseDate);
    });

    res.json({
      success: true,
      releases: sortedReleases
    });
  } catch (error) {
    console.error('Get releases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch releases'
    });
  }
});

// Get single release (Public)
router.get('/:id', (req, res) => {
  try {
    const releases = readJSON('releases.json');
    const release = releases.find(r => r.id === req.params.id);

    if (!release) {
      return res.status(404).json({
        success: false,
        message: 'Release not found'
      });
    }

    res.json({
      success: true,
      release
    });
  } catch (error) {
    console.error('Get release error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch release'
    });
  }
});

// Get releases by artist (Public)
router.get('/artist/:artistId', (req, res) => {
  try {
    const releases = readJSON('releases.json');
    const artistReleases = releases.filter(r => r.artistId === req.params.artistId);

    res.json({
      success: true,
      releases: artistReleases
    });
  } catch (error) {
    console.error('Get artist releases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artist releases'
    });
  }
});

// Delete release (Admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const releases = readJSON('releases.json');
    const releaseIndex = releases.findIndex(r => r.id === req.params.id);

    if (releaseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Release not found'
      });
    }

    const deletedRelease = releases.splice(releaseIndex, 1)[0];
    writeJSON('releases.json', releases);

    res.json({
      success: true,
      message: 'Release deleted successfully',
      deletedRelease
    });
  } catch (error) {
    console.error('Delete release error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete release'
    });
  }
});

module.exports = router;
