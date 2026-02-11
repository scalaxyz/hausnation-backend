# 🎵 Hausnation Backend API

Modern REST API for Hausnation music label with Spotify integration, JWT authentication, and JSON-based database.

## ✨ Features

- 🎨 Spotify API integration (auto-fetch artist catalogs)
- 🔐 JWT authentication for admin panel
- 🤖 Google reCAPTCHA v3 for contact form
- 📦 JSON file-based database (no database server needed)
- 🚀 Shared hosting compatible
- 🛡️ Security headers with Helmet
- ⚡ Rate limiting
- 🎯 CORS enabled

## 📋 Prerequisites

- Node.js 14+ (check with `node --version`)
- npm (comes with Node.js)
- Spotify Developer Account (free)
- Google reCAPTCHA account (free)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` file with your credentials:

```env
# Server
PORT=3000
NODE_ENV=production

# Spotify API (get from https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# JWT Secret (generate random string)
JWT_SECRET=your_super_secret_random_string_here

# Google reCAPTCHA v3 (get from https://www.google.com/recaptcha/admin)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret

# Frontend URL
FRONTEND_URL=https://hausnation.com

# Admin Login
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123
```

### 3. Get Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in app name and description
5. Copy **Client ID** and **Client Secret** to `.env`

### 4. Get reCAPTCHA Credentials

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register a new site
3. Choose **reCAPTCHA v3**
4. Add your domain
5. Copy **Secret Key** to `.env`

### 5. Run Locally

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## 🌐 Hostinger Deployment

### Method 1: Node.js Hosting (Recommended)

If your Hostinger plan supports Node.js:

1. **Upload Files via FTP/SFTP**
   - Upload all files except `node_modules/`
   - Keep the folder structure intact

2. **SSH into your server**
   ```bash
   ssh username@yourdomain.com
   ```

3. **Navigate to your app directory**
   ```bash
   cd public_html/api
   # or wherever you uploaded the files
   ```

4. **Install dependencies**
   ```bash
   npm install --production
   ```

5. **Setup environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your credentials
   ```

6. **Start with PM2 (keeps server running)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name hausnation-api
   pm2 save
   pm2 startup
   ```

7. **Configure reverse proxy** (if needed)
   In your `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
   ```

### Method 2: VPS Hosting

If you have VPS access:

1. **Clone/Upload repository**
   ```bash
   git clone <your-repo-url>
   cd hausnation-backend
   ```

2. **Install Node.js** (if not installed)
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Follow steps 4-6 from Method 1**

4. **Configure Nginx** (if using)
   ```nginx
   server {
       listen 80;
       server_name api.hausnation.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Method 3: Shared Hosting (PHP-based)

If only PHP is available, you'll need to:
1. Use a service like Heroku, Railway, or Render for the backend
2. Point your frontend to that API URL

## 📡 API Endpoints

### Public Endpoints

```
GET  /                    - API info
GET  /api/health         - Health check
GET  /api/artists        - Get all artists
GET  /api/artists/:id    - Get single artist
GET  /api/releases       - Get all releases
GET  /api/releases/:id   - Get single release
POST /api/contact        - Submit contact form (requires reCAPTCHA)
```

### Admin Endpoints (Require JWT Token)

```
POST   /api/auth/login                - Login (get JWT token)
GET    /api/auth/verify               - Verify token
POST   /api/artists/search-spotify    - Search Spotify catalog
POST   /api/artists                   - Add artist with releases
DELETE /api/artists/:id               - Delete artist
DELETE /api/releases/:id              - Delete release
```

## 🔑 Admin Authentication

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}

# Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

### Use Token

```bash
GET /api/artists
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🎵 Adding Artists (Admin Flow)

### 1. Search Spotify Catalog

```bash
POST /api/artists/search-spotify
Authorization: Bearer <token>
Content-Type: application/json

{
  "artistUrl": "https://open.spotify.com/artist/ARTIST_ID"
}

# Response: Full catalog with all releases and tracks
```

### 2. Add Artist with Selected Releases

```bash
POST /api/artists
Authorization: Bearer <token>
Content-Type: application/json

{
  "artist": {
    "id": "spotify_artist_id",
    "name": "Artist Name",
    "image": "image_url",
    "genres": ["house", "electronic"],
    "popularity": 75,
    "followers": 50000,
    "spotifyUrl": "https://..."
  },
  "selectedReleases": [
    {
      "id": "album_id",
      "name": "Album Name",
      "type": "album",
      "releaseDate": "2024-01-01",
      "totalTracks": 10,
      "image": "cover_url",
      "spotifyUrl": "https://...",
      "tracks": [...]
    }
  ]
}
```

## 📁 Project Structure

```
hausnation-backend/
├── data/                 # JSON database files
│   ├── artists.json
│   ├── releases.json
│   └── admin.json
├── middleware/
│   ├── auth.js          # JWT verification
│   └── recaptcha.js     # reCAPTCHA verification
├── routes/
│   ├── auth.js          # Login & verification
│   ├── artists.js       # Artist CRUD + Spotify
│   ├── releases.js      # Release management
│   └── contact.js       # Contact form
├── services/
│   └── spotify.js       # Spotify API integration
├── utils/
│   └── db.js           # JSON database utilities
├── .env.example        # Environment template
├── .gitignore
├── package.json
├── server.js           # Main application
└── README.md
```

## 🔒 Security Features

- ✅ Helmet.js (security headers)
- ✅ Rate limiting (100 req/15min per IP)
- ✅ JWT authentication (24h expiry)
- ✅ bcrypt password hashing
- ✅ reCAPTCHA v3 bot protection
- ✅ CORS configuration
- ✅ Input validation

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Permission Denied on data/ folder

```bash
chmod 755 data/
chmod 644 data/*.json
```

### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
```

### Spotify API Errors

- Check if credentials are correct in `.env`
- Verify your app is not in development mode quota limits
- Test credentials at [Spotify Console](https://developer.spotify.com/console/)

## 📞 Support

For issues or questions:
- Check existing issues
- Create new issue with error details
- Include your Node.js version and environment

## 📄 License

MIT License - feel free to use for your music label!

---

**Built with ❤️ for Hausnation**
