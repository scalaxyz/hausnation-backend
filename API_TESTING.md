# 🧪 API Testing Guide

Test your Hausnation API endpoints using these examples.

## Prerequisites

- API running locally or on Hostinger
- **curl** or **Postman** installed
- For protected endpoints: JWT token from login

## Base URL

Local: `http://localhost:3000`
Production: `https://yourdomain.com/api` or `https://api.yourdomain.com`

---

## 1️⃣ Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Hausnation API is running",
  "timestamp": "2024-02-11T10:30:00.000Z"
}
```

---

## 2️⃣ Authentication

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "hausnation2024"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin"
  }
}
```

**Save the token for next steps!**

### Verify Token

```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 3️⃣ Spotify Integration

### Search Artist on Spotify

```bash
curl -X POST http://localhost:3000/api/artists/search-spotify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "artistUrl": "https://open.spotify.com/artist/1vCWHaC5f2uS3yhpwWbIA6"
  }'
```

**Example Artist URLs:**
- Avicii: `https://open.spotify.com/artist/1vCWHaC5f2uS3yhpwWbIA6`
- Calvin Harris: `https://open.spotify.com/artist/7CajNmpbOovFoOoasH2HaY`
- Daft Punk: `https://open.spotify.com/artist/4tZwfgrHOc3mvqYlEYSvVi`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "artist": {
      "spotifyId": "1vCWHaC5f2uS3yhpwWbIA6",
      "name": "Avicii",
      "image": "https://i.scdn.co/image/...",
      "genres": ["dance pop", "edm", "pop"],
      "followers": 15000000,
      "popularity": 85,
      "spotifyUrl": "https://open.spotify.com/artist/..."
    },
    "tracks": [
      {
        "spotifyId": "5HCyWlXZPP0y6Gqq8TgA20",
        "name": "Wake Me Up",
        "album": "True",
        "albumType": "album",
        "releaseDate": "2013-09-13",
        "coverArt": "https://i.scdn.co/image/...",
        "duration": 247000,
        "trackNumber": 1,
        "spotifyUrl": "https://open.spotify.com/track/...",
        "previewUrl": "https://p.scdn.co/mp3-preview/..."
      }
      // ... more tracks
    ]
  }
}
```

---

## 4️⃣ Artists Management

### Add Artist to Label

```bash
curl -X POST http://localhost:3000/api/artists/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "artist": {
      "spotifyId": "1vCWHaC5f2uS3yhpwWbIA6",
      "name": "Avicii",
      "image": "https://i.scdn.co/image/...",
      "genres": ["dance pop", "edm"],
      "followers": 15000000,
      "popularity": 85,
      "spotifyUrl": "https://open.spotify.com/artist/..."
    },
    "selectedTracks": [
      {
        "spotifyId": "5HCyWlXZPP0y6Gqq8TgA20",
        "name": "Wake Me Up",
        "album": "True",
        "albumType": "album",
        "releaseDate": "2013-09-13",
        "coverArt": "https://i.scdn.co/image/...",
        "duration": 247000,
        "spotifyUrl": "https://open.spotify.com/track/..."
      }
    ]
  }'
```

### Get All Artists (Public)

```bash
curl http://localhost:3000/api/artists
```

### Get Single Artist (Public)

```bash
curl http://localhost:3000/api/artists/ARTIST_ID
```

### Delete Artist

```bash
curl -X DELETE http://localhost:3000/api/artists/ARTIST_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 5️⃣ Releases Management

### Get All Releases (Public)

```bash
curl http://localhost:3000/api/releases
```

### Get Single Release (Public)

```bash
curl http://localhost:3000/api/releases/RELEASE_ID
```

### Get Releases by Artist (Public)

```bash
curl http://localhost:3000/api/releases/artist/ARTIST_ID
```

### Add Release

```bash
curl -X POST http://localhost:3000/api/releases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "artistId": "1234567890",
    "artistName": "Avicii",
    "track": {
      "spotifyId": "5HCyWlXZPP0y6Gqq8TgA20",
      "name": "Wake Me Up",
      "album": "True",
      "releaseDate": "2013-09-13",
      "coverArt": "https://i.scdn.co/image/...",
      "spotifyUrl": "https://open.spotify.com/track/..."
    }
  }'
```

### Delete Release

```bash
curl -X DELETE http://localhost:3000/api/releases/RELEASE_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 6️⃣ Contact Form

### Submit Contact (Public with reCAPTCHA)

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Booking Inquiry",
    "message": "Hello, I would like to book an artist for my event.",
    "recaptchaToken": "RECAPTCHA_TOKEN_FROM_FRONTEND"
  }'
```

**Note:** In production, the recaptchaToken must be obtained from the frontend using Google reCAPTCHA v3.

### Get All Contacts (Admin)

```bash
curl http://localhost:3000/api/contact \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Mark Contact as Read (Admin)

```bash
curl -X PUT http://localhost:3000/api/contact/CONTACT_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Delete Contact (Admin)

```bash
curl -X DELETE http://localhost:3000/api/contact/CONTACT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧰 Postman Collection

You can import these into Postman for easier testing:

1. Open Postman
2. Click **Import**
3. Create a new Collection: "Hausnation API"
4. Add these requests with proper headers

### Environment Variables in Postman

Create these variables:
- `baseUrl`: `http://localhost:3000/api`
- `token`: Your JWT token after login

Then use `{{baseUrl}}` and `{{token}}` in your requests.

---

## 🐛 Common Errors

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```
**Fix:** Include `Authorization: Bearer YOUR_TOKEN` header

### 400 Bad Request
```json
{
  "success": false,
  "message": "Artist info and selected tracks are required"
}
```
**Fix:** Check request body format

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests from this IP"
}
```
**Fix:** Wait 15 minutes or use different IP

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to authenticate with Spotify"
}
```
**Fix:** Check Spotify credentials in `.env`

---

## ✅ Testing Checklist

Before going live:

- [ ] Test health endpoint
- [ ] Test admin login
- [ ] Test Spotify search with real artist
- [ ] Test adding artist with tracks
- [ ] Test getting artists (public)
- [ ] Test adding release
- [ ] Test getting releases (public)
- [ ] Test contact form submission
- [ ] Test rate limiting (send 100+ requests)
- [ ] Test CORS with frontend URL
- [ ] Test all protected endpoints without token (should fail)
- [ ] Test invalid Spotify URLs

---

Happy Testing! 🎵
