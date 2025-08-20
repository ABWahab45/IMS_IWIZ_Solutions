# Environment Setup Guide

This guide explains how to switch between local development and production environments for your Inventory Management System.

## Current Setup

- **Frontend**: Deployed on Vercel (stays on Vercel)
- **Backend**: Deployed on Render (can be run locally for testing)
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary

## Quick Switch Scripts

### For Local Testing (Windows)
```bash
# Run this script to switch to local environment
switch-to-local.bat
```

### For Production (Windows)
```bash
# Run this script to switch back to production environment
switch-to-production.bat
```

## Manual Setup

### Local Environment Setup

#### Frontend (React) - Vercel Deployment
1. Create/update `frontend/.env.local`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BACKEND_URL=http://localhost:5000
```
**Note**: The frontend remains deployed on Vercel, but will connect to your local backend.

#### Backend (Node.js) - Local Development
1. Create/update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://AbdulWahab:Qwerty1122@cluster0.8apfguz.mongodb.net/iwiz_inventory?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
NODE_ENV=development
JWT_SECRET=5a70d35684296d99997ae2e7fb1cf9bd77ee8e1f4890c4c4c8da021a6291c1c5b210f165b7086b39fe4e8d58bc86af4470c156097d0b6c4213cb01021b1d5b27
JWT_EXPIRE=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
MAX_FILE_SIZE=10485760
CLOUDINARY_CLOUD_NAME=dermm8zsk
CLOUDINARY_API_KEY=967688844686185
CLOUDINARY_API_SECRET=PuLX6WNIXYLIc8eSSyF-fSqYy6E
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

### Production Environment Setup

#### Frontend (React) - Vercel
1. Use `frontend/env.production`:
```env
REACT_APP_API_URL=https://ims-iwiz-solutions.onrender.com/api
REACT_APP_BACKEND_URL=https://ims-iwiz-solutions.onrender.com
```

#### Backend (Node.js) - Render
1. Use `backend/env.config`:
```env
MONGODB_URI=mongodb+srv://AbdulWahab:Qwerty1122@cluster0.8apfguz.mongodb.net/iwiz_inventory?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
NODE_ENV=production
JWT_SECRET=5a70d35684296d99997ae2e7fb1cf9bd77ee8e1f4890c4c4c8da021a6291c1c5b210f165b7086b39fe4e8d58bc86af4470c156097d0b6c4213cb01021b1d5b27
JWT_EXPIRE=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
CLOUDINARY_CLOUD_NAME=dermm8zsk
CLOUDINARY_API_KEY=967688844686185
CLOUDINARY_API_SECRET=PuLX6WNIXYLIc8eSSyF-fSqYy6E
```

## Running the Application

### Local Development (Backend Only)
1. **Start Backend Locally**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend will run on: http://localhost:5000

2. **Frontend**: Access your Vercel deployment
   - Your Vercel frontend will automatically connect to the local backend

### Production
- Frontend: Automatically deployed on Vercel
- Backend: Automatically deployed on Render

## Key Differences

| Setting | Local | Production |
|---------|-------|------------|
| Frontend | Vercel deployment | Vercel deployment |
| Backend | http://localhost:5000 | https://ims-iwiz-solutions.onrender.com |
| API URL | http://localhost:5000/api | https://ims-iwiz-solutions.onrender.com/api |
| NODE_ENV | development | production |
| Rate Limit | 1000 requests | 100 requests |
| CORS | Vercel domain | Vercel domain |

## Testing Workflow

### For Local Backend Testing:
1. Run `switch-to-local.bat`
2. Start your local backend: `cd backend && npm start`
3. Access your Vercel frontend - it will connect to your local backend
4. Test your backend changes locally

### For Production:
1. Run `switch-to-production.bat`
2. Your Vercel frontend will connect to the Render backend
3. Deploy backend changes to Render when ready

## Troubleshooting

### Frontend can't connect to backend
1. Ensure backend is running on port 5000
2. Check that `.env.local` has correct API URL
3. Verify CORS settings in backend allow your Vercel domain

### Backend won't start
1. Check MongoDB connection string
2. Ensure all environment variables are set
3. Check if port 5000 is available

### Images not uploading
1. Verify Cloudinary credentials
2. Check file size limits
3. Ensure proper CORS headers

## Security Notes

- Never commit `.env` files to version control
- Keep production secrets secure
- Use different JWT secrets for different environments
- Regularly rotate API keys and secrets
- Update CORS settings to include your Vercel domain
