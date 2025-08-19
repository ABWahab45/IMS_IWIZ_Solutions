# Deployment Guide - Image System Fix

## Problem
After deploying to Render, Vercel, and GitHub, the image system (avatars and product images) is not working because:
1. Render has an ephemeral file system - uploaded files are lost on server restart
2. Missing environment variables in frontend
3. Incorrect image URL construction in deployment environment

## Solutions

### 1. Environment Variables Setup

#### Frontend (Vercel)
Add these environment variables in your Vercel project settings:

```
REACT_APP_API_URL=https://ims-iwiz-solutions.onrender.com/api
REACT_APP_BACKEND_URL=https://ims-iwiz-solutions.onrender.com
```

#### Backend (Render)
Add these environment variables in your Render project settings:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
```

### 2. File Storage Solutions

#### Option A: Cloud Storage (Recommended)
For production, use cloud storage services like:
- AWS S3
- Cloudinary
- Firebase Storage
- Google Cloud Storage

#### Option B: Persistent Volume (Render)
If using Render, configure a persistent volume for file storage.

#### Option C: Database Storage (Temporary)
Store images as base64 in database (not recommended for large files).

### 3. Immediate Fix for Current Deployment

The current code has been updated to:
1. Store only filenames in the database
2. Construct full URLs on the frontend
3. Handle deployment environments properly

### 4. Testing the Fix

1. **Redeploy both frontend and backend**
2. **Test image uploads** - they should work temporarily until server restart
3. **Check image URLs** - they should be constructed correctly
4. **Monitor console logs** - check for any URL construction issues

### 5. Long-term Solution

For a permanent solution, implement cloud storage:

```javascript
// Example with Cloudinary
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload to cloudinary instead of local storage
const result = await cloudinary.uploader.upload(file.path);
return result.secure_url;
```

### 6. Current Status

✅ **Fixed Issues:**
- Image URL construction for deployment
- Environment variable handling
- File path storage optimization

⚠️ **Remaining Issues:**
- Ephemeral file system on Render
- Files lost on server restart

### 7. Next Steps

1. **Immediate**: Redeploy with current fixes
2. **Short-term**: Implement cloud storage
3. **Long-term**: Set up CDN for better performance

## Testing Checklist

- [ ] Frontend environment variables set
- [ ] Backend environment variables set
- [ ] Image uploads work
- [ ] Image display works in product list
- [ ] Image display works in product detail
- [ ] Avatar uploads work
- [ ] Avatar display works
- [ ] Images persist after server restart (if using cloud storage)

## Troubleshooting

### Images not loading
1. Check browser console for URL construction errors
2. Verify environment variables are set correctly
3. Check if backend is serving static files properly

### Upload errors
1. Check file size limits
2. Verify file type restrictions
3. Check upload directory permissions

### Environment issues
1. Verify NODE_ENV is set to 'production'
2. Check all required environment variables
3. Restart the application after environment changes
