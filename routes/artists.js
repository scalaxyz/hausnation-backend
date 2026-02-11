const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const spotifyService = require('../services/spotify');
const { readJSON, writeJSON, generateId } = require('../utils/db');

// Get all artists (Public)
router.get('/', (req, res) => {
  try {
    const artists = readJSON('artists.json');
    res.json({
      success: true,
      artists
    });
  } catch (error) {
    console.error('Get artists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artists'
    });
  }
});

// Get single artist (Public)
router.get('/:id', (req, res) => {
  try {
    const artists = readJSON('artists.json');
    const artist = artists.find(a => a.id === req.params.id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.json({
      success: true,
      artist
    });
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artist'
    });
  }
});

// Search Spotify for artist catalog (Admin only)
router.post('/search-spotify', authMiddleware, async (req, res) => {
  try {
    const { artistUrl } = req.body;

    if (!artistUrl) {
      return res.status(400).json({
        success: false,
        message: 'Artist URL is required'
      });
    }

    const catalog = await spotifyService.getFullCatalog(artistUrl);

    res.json({
      success: true,
      catalog
    });
  } catch (error) {
    console.error('Search Spotify error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search Spotify'
    });
  }
});

// Add artist with selected releases (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { artist, selectedReleases } = req.body;

    if (!artist || !selectedReleases || !Array.isArray(selectedReleases)) {
      return res.status(400).json({
        success: false,
        message: 'Artist info and selected releases are required'
      });
    }

    const artists = readJSON('artists.json');
    const releases = readJSON('releases.json');

    // Check if artist already exists
    const existingArtist = artists.find(a => a.spotifyId === artist.id);
    if (existingArtist) {
      return res.status(400).json({
        success: false,
        message: 'Artist already exists in the catalog'
      });
    }

    // Create artist record
    const newArtist = {
      id: generateId(),
      spotifyId: artist.id,
      name: artist.name,
      image: artist.image,
      genres: artist.genres,
      popularity: artist.popularity,
      followers: artist.followers,
      spotifyUrl: artist.spotifyUrl,
      addedAt: new Date().toISOString()
    };

    // Add selected releases
    const newReleases = selectedReleases.map(release => ({
      id: generateId(),
      artistId: newArtist.id,
      artistName: newArtist.name,
      spotifyAlbumId: release.id,
      name: release.name,
      type: release.type,
      releaseDate: release.releaseDate,
      totalTracks: release.totalTracks,
      image: release.image,
      spotifyUrl: release.spotifyUrl,
      tracks: release.tracks || [],
      addedAt: new Date().toISOString()
    }));

    // Save to database
    artists.push(newArtist);
    releases.push(...newReleases);

    writeJSON('artists.json', artists);
    writeJSON('releases.json', releases);

    res.json({
      success: true,
      artist: newArtist,
      releases: newReleases,
      message: 'Artist and releases added successfully'
    });
  } catch (error) {
    console.error('Add artist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add artist'
    });
  }
});

// Delete artist (Admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const artists = readJSON('artists.json');
    const releases = readJSON('releases.json');

    const artistIndex = artists.findIndex(a => a.id === req.params.id);

    if (artistIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    // Remove artist
    const deletedArtist = artists.splice(artistIndex, 1)[0];

    // Remove all releases by this artist
    const updatedReleases = releases.filter(r => r.artistId !== req.params.id);

    writeJSON('artists.json', artists);
    writeJSON('releases.json', updatedReleases);

    res.json({
      success: true,
      message: 'Artist and their releases deleted successfully',
      deletedArtist
    });
  } catch (error) {
    console.error('Delete artist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete artist'
    });
  }
});

module.exports = router;
