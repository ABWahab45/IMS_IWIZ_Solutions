# 🚀 Cloudflare Tunnel Server Setup Guide

## Your Cloudflare Tunnel URL
**https://chosen-annotation-hearings-improvement.trycloudflare.com**

---

## 📋 Prerequisites (Install on Server PC)

### 1. Install Node.js
```bash
# Download and install Node.js 18+ from: https://nodejs.org/
# Verify installation:
node --version
npm --version
```

### 2. Install Cloudflared
```bash
# Windows: Download from https://github.com/cloudflare/cloudflared/releases
# Or use winget:
winget install Cloudflare.cloudflared

# Verify installation:
cloudflared --version
```

### 3. Install PM2 (Optional but recommended)
```bash
npm install -g pm2
```

---

## 🔧 Server Setup Steps

### Step 1: Copy Backend Files
Copy your entire `backend` folder to the server PC.

### Step 2: Navigate to Backend Directory
```bash
cd "path/to/your/backend"
```

### Step 3: Run Setup Script
```bash
node scripts/setup-cloudflare-tunnel.js
```

This will create:
- ✅ `.env` file with production settings
- ✅ `ecosystem.config.js` for PM2
- ✅ `start-cloudflare.bat` startup script
- ✅ `cloudflare-config.yml` template

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Test Database Connection
```bash
npm run test:connection
```

---

## 🚀 Starting the Server

### Option 1: Direct Start
```bash
npm start
```

### Option 2: Using PM2 (Recommended)
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 3: Using Batch File
```bash
start-cloudflare.bat
```

---

## 🔗 Testing Your Backend

### Health Check
Visit: **https://chosen-annotation-hearings-improvement.trycloudflare.com/api/health**

### API Endpoints
- **API Base**: `https://chosen-annotation-hearings-improvement.trycloudflare.com/api`
- **Auth**: `https://chosen-annotation-hearings-improvement.trycloudflare.com/api/auth`
- **Products**: `https://chosen-annotation-hearings-improvement.trycloudflare.com/api/products`

---

## 📱 Frontend Configuration

### Update Vercel Environment Variables
Add these to your Vercel project:

```
REACT_APP_CLOUDFLARE_API_URL=https://chosen-annotation-hearings-improvement.trycloudflare.com/api
REACT_APP_CLOUDFLARE_BACKEND_URL=https://chosen-annotation-hearings-improvement.trycloudflare.com
```

### Test Frontend Connection
Your frontend will automatically detect and use the Cloudflare backend when available.

---

## 🔍 Troubleshooting

### Check Server Status
```bash
# If using PM2:
pm2 status
pm2 logs

# Check if port 5000 is in use:
netstat -an | findstr :5000
```

### Test Local Connection
```bash
curl http://localhost:5000/api/health
```

### Check Cloudflare Tunnel
```bash
cloudflared tunnel list
```

---

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit
```

### Logs
- **PM2 Logs**: `pm2 logs`
- **Application Logs**: `logs/` directory
- **Error Logs**: `logs/err.log`

---

## 🔄 Auto-Start on Boot

### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: "At startup"
4. Action: Start a program
5. Program: `pm2`
6. Arguments: `resurrect`

### Or use PM2 startup
```bash
pm2 startup
pm2 save
```

---

## ✅ Success Indicators

- ✅ Server starts without errors
- ✅ Health check returns 200 OK
- ✅ Database connection successful
- ✅ Cloudflare tunnel active
- ✅ Frontend can connect to backend

---

## 🆘 Support

If you encounter issues:
1. Check the logs: `pm2 logs` or `logs/err.log`
2. Verify database connection: `npm run test:connection`
3. Test local access: `http://localhost:5000/api/health`
4. Check Cloudflare tunnel status

**Your backend will be available at: https://chosen-annotation-hearings-improvement.trycloudflare.com**
