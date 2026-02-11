const axios = require('axios');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get Spotify access token
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      console.error('Spotify auth error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  // Extract artist ID from Spotify URL
  extractArtistId(url) {
    const patterns = [
      /spotify\.com\/artist\/([a-zA-Z0-9]+)/,
      /^([a-zA-Z0-9]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    throw new Error('Invalid Spotify artist URL or ID');
  }

  // Get artist details
  async getArtist(artistUrl) {
    try {
      const artistId = this.extractArtistId(artistUrl);
      const token = await this.getAccessToken();

      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return {
        id: response.data.id,
        name: response.data.name,
        image: response.data.images[0]?.url || null,
        genres: response.data.genres,
        popularity: response.data.popularity,
        followers: response.data.followers.total,
        spotifyUrl: response.data.external_urls.spotify
      };
    } catch (error) {
      console.error('Get artist error:', error.response?.data || error.message);
      throw new Error('Failed to fetch artist from Spotify');
    }
  }

  // Get artist's albums and singles
  async getArtistReleases(artistUrl) {
    try {
      const artistId = this.extractArtistId(artistUrl);
      const token = await this.getAccessToken();

      // Get all albums, singles, and appears_on
      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}/albums`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            include_groups: 'album,single,appears_on',
            limit: 50
          }
        }
      );

      const releases = response.data.items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.album_type,
        releaseDate: item.release_date,
        totalTracks: item.total_tracks,
        image: item.images[0]?.url || null,
        spotifyUrl: item.external_urls.spotify
      }));

      return releases;
    } catch (error) {
      console.error('Get releases error:', error.response?.data || error.message);
      throw new Error('Failed to fetch releases from Spotify');
    }
  }

  // Get tracks from an album/single
  async getAlbumTracks(albumId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `https://api.spotify.com/v1/albums/${albumId}/tracks`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const tracks = response.data.items.map(item => ({
        id: item.id,
        name: item.name,
        trackNumber: item.track_number,
        duration: item.duration_ms,
        previewUrl: item.preview_url,
        spotifyUrl: item.external_urls.spotify
      }));

      return tracks;
    } catch (error) {
      console.error('Get tracks error:', error.response?.data || error.message);
      throw new Error('Failed to fetch tracks from Spotify');
    }
  }

  // Get full artist catalog (artist + all releases with tracks)
  async getFullCatalog(artistUrl) {
    try {
      const artist = await this.getArtist(artistUrl);
      const releases = await this.getArtistReleases(artistUrl);

      // Get tracks for each release
      const releasesWithTracks = await Promise.all(
        releases.map(async (release) => {
          const tracks = await this.getAlbumTracks(release.id);
          return {
            ...release,
            tracks
          };
        })
      );

      return {
        artist,
        releases: releasesWithTracks
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SpotifyService();
