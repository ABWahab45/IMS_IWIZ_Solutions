# Server Deployment Guide

This guide explains how to deploy your backend on their server PC and connect your Vercel frontend to it.

## 🎯 **Your Setup:**
- **Frontend**: Vercel (stays on Vercel)
- **Backend**: Their server PC (new deployment)
- **Database**: MongoDB Atlas (same)
- **Images**: Cloudinary (same)

## 📋 **Prerequisites for Server PC:**

### **1. Server Requirements:**
- Windows/Linux server
- Node.js installed (version 16 or higher)
- npm or yarn installed
- Port 3000 available
- Internet connection for MongoDB Atlas and Cloudinary

### **2. Get Server Information:**
- **Server IP Address** (e.g., 192.168.1.100)
- **Server Domain** (if available)
- **Port availability** (default: 3000)

## 🚀 **Deployment Steps:**

### **Step 1: Prepare Your Code**
1. **Switch to server environment:**
   ```bash
   switch-to-server.bat
   ```

2. **Update server IP in frontend/env.server:**
   ```env
   REACT_APP_API_URL=http://THEIR_SERVER_IP:3000/api
   REACT_APP_BACKEND_URL=http://THEIR_SERVER_IP:3000
   ```
   Replace `THEIR_SERVER_IP` with actual server IP

### **Step 2: Deploy to Server PC**

#### **Option A: Direct File Transfer**
1. **Copy your backend folder to server PC**
2. **On server PC, run:**
   ```bash
   cd backend
   npm install
   npm start
   ```

#### **Option B: Git Deployment**
1. **Push your code to Git repository**
2. **On server PC, run:**
   ```bash
   git clone YOUR_REPOSITORY_URL
   cd backend
   npm install
   npm start
   ```

### **Step 3: Configure Server**

#### **Windows Server:**
```bash
# Install Node.js if not installed
# Download from https://nodejs.org/

# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

#### **Linux Server:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

### **Step 4: Update Vercel Environment Variables**

1. **Go to Vercel Dashboard**
2. **Navigate to your project settings**
3. **Go to Environment Variables**
4. **Update with server IP:**

```
REACT_APP_API_URL=http://THEIR_SERVER_IP:3000/api
REACT_APP_BACKEND_URL=http://THEIR_SERVER_IP:3000
```

5. **Redeploy your Vercel app**

## 🔧 **Server Configuration:**

### **Port Configuration:**
- **Default**: Port 3000
- **Change if needed**: Update `PORT` in `backend/env.server`

### **CORS Configuration:**
Update `backend/server.js` to allow your Vercel domain:

```javascript
const allowedOrigins = [
  'https://iwiz-inventory.vercel.app', 
  'https://iwiz-inventory-git-main.vercel.app',
  'https://ims-iwiz-solutions.vercel.app',
  'https://ims-iwiz-solutions-git-main.vercel.app',
  // Add your Vercel domain here
];
```

### **Firewall Configuration:**
- **Windows**: Allow port 3000 in Windows Firewall
- **Linux**: `sudo ufw allow 3000`

## 🧪 **Testing:**

### **Test Server Connection:**
```bash
# Test from your local PC
curl http://THEIR_SERVER_IP:3000/api/health
```

### **Test from Vercel:**
1. Visit your Vercel deployment
2. Check browser console for connection errors
3. Test login/registration functionality

## 🔄 **Environment Switching:**

### **For Local Testing (ngrok):**
```bash
switch-to-local.bat
```

### **For Server Deployment:**
```bash
switch-to-server.bat
```

### **For Production (Render):**
```bash
switch-to-production.bat
```

## ⚠️ **Important Notes:**

### **Security:**
- **Use HTTPS** if possible (for production)
- **Configure firewall** properly
- **Use strong JWT secrets**
- **Regular security updates**

### **Performance:**
- **Monitor server resources**
- **Set up logging**
- **Configure PM2 for process management**

### **Backup:**
- **Regular database backups**
- **Code version control**
- **Environment configuration backup**

## 🛠️ **Troubleshooting:**

### **Server Won't Start:**
1. Check if port 3000 is available
2. Verify Node.js installation
3. Check environment variables
4. Review error logs

### **Connection Issues:**
1. Verify server IP address
2. Check firewall settings
3. Test network connectivity
4. Verify CORS configuration

### **Database Connection:**
1. Check MongoDB Atlas connection string
2. Verify network access to MongoDB
3. Check authentication credentials

## 📞 **Support:**

If you encounter issues:
1. Check server logs
2. Verify network connectivity
3. Test individual components
4. Review this guide

---

**Your Vercel frontend will now connect to your server-deployed backend!** 🎉
