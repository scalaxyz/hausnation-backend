# 🚀 Hostinger Deployment Guide

## Step-by-Step Hostinger Deployment

### 1. Access Your Hostinger Account

1. Log in to Hostinger
2. Go to **hPanel**
3. Click on **File Manager** or use **SSH Access**

### 2. Upload Backend Files

**Option A: Using File Manager**
1. Open File Manager
2. Navigate to `public_html` or create a new folder like `api`
3. Upload all backend files
4. Extract if uploaded as ZIP

**Option B: Using SSH (Recommended)**
1. Enable SSH in hPanel
2. Connect via terminal:
```bash
ssh your-username@your-domain.com
```

3. Navigate to your directory:
```bash
cd ~/public_html
mkdir api
cd api
```

4. Upload files using SFTP or Git

### 3. Install Node.js

If Node.js is not installed:

1. Go to hPanel → **Advanced** → **SSH Access**
2. Install NVM (Node Version Manager):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
```

3. Install Node.js:
```bash
nvm install 18
nvm use 18
node --version  # Should show v18.x.x
```

### 4. Install Dependencies

```bash
cd ~/public_html/api
npm install
```

### 5. Configure Environment

```bash
cp .env.example .env
nano .env
```

Update all the values in `.env` file.

### 6. Start the Server with PM2

Install PM2:
```bash
npm install -g pm2
```

Start your API:
```bash
pm2 start server.js --name hausnation-api
pm2 save
pm2 startup
```

### 7. Configure Reverse Proxy (for api.yourdomain.com)

**Option A: Using .htaccess (Apache)**

Create `.htaccess` in your root directory:

```apache
RewriteEngine On

# Redirect API requests to Node.js app
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

**Option B: Using Nginx (if available)**

Add to your nginx config:

```nginx
location /api/ {
    proxy_pass http://localhost:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 8. Setup Subdomain (Optional)

If you want `api.hausnation.com`:

1. Go to hPanel → **Domains** → **Subdomains**
2. Create subdomain: `api`
3. Point document root to your API folder
4. Configure reverse proxy as above

### 9. Test Your API

```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Hausnation API is running",
  "timestamp": "2024-02-11T..."
}
```

### 10. Monitor Your App

Check logs:
```bash
pm2 logs hausnation-api
```

Check status:
```bash
pm2 status
```

Restart if needed:
```bash
pm2 restart hausnation-api
```

## Common Issues

### Port Already in Use
```bash
pm2 stop hausnation-api
pm2 delete hausnation-api
pm2 start server.js --name hausnation-api
```

### Permission Errors
```bash
chmod -R 755 ~/public_html/api
```

### Node.js Not Found
```bash
# Add to ~/.bashrc
export PATH=$HOME/.nvm/versions/node/v18.x.x/bin:$PATH
source ~/.bashrc
```

### Cannot Connect to API
- Check if PM2 is running: `pm2 status`
- Check firewall: Make sure port 3000 is accessible
- Verify reverse proxy configuration
- Check error logs: `pm2 logs hausnation-api --err`

## Security Checklist

- ✅ Change default admin username/password
- ✅ Generate strong JWT secret
- ✅ Enable HTTPS/SSL on your domain
- ✅ Keep Node.js and dependencies updated
- ✅ Set proper file permissions (755 for directories, 644 for files)
- ✅ Add your actual frontend URL to CORS settings
- ✅ Enable rate limiting (already configured)

## Performance Tips

1. **Enable caching** in your reverse proxy
2. **Use compression** (gzip)
3. **Monitor memory usage**: `pm2 monit`
4. **Set up automatic restarts**: Already done with PM2

## Backup Strategy

1. **Backup data folder regularly**:
```bash
cd ~/public_html/api
tar -czf backup-$(date +%Y%m%d).tar.gz data/
```

2. **Automated backup** (add to crontab):
```bash
crontab -e
# Add this line (backup daily at 2 AM):
0 2 * * * cd ~/public_html/api && tar -czf ~/backups/hausnation-$(date +\%Y\%m\%d).tar.gz data/
```

## Need Help?

Contact Hostinger support for:
- SSH access issues
- Node.js installation
- Reverse proxy configuration
- SSL certificate setup

---

🎵 Your Hausnation API should now be live!
