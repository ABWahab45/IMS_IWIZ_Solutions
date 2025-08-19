#!/bin/bash

echo "🚀 Starting deployment process for IMS..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Checking environment files..."

# Check if environment files exist
if [ ! -f "frontend/env.production" ]; then
    echo "⚠️  Warning: frontend/env.production not found"
    echo "   Please create it with the following content:"
    echo "   REACT_APP_API_URL=https://ims-iwiz-solutions.onrender.com/api"
    echo "   REACT_APP_BACKEND_URL=https://ims-iwiz-solutions.onrender.com"
fi

if [ ! -f "backend/env.config" ]; then
    echo "⚠️  Warning: backend/env.config not found"
    echo "   Please ensure your backend environment variables are set in Render"
fi

echo "🔧 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Frontend build completed"

echo "📝 Deployment Checklist:"
echo ""
echo "1. ✅ Code fixes applied:"
echo "   - Image URL construction improved"
echo "   - File storage optimized"
echo "   - Environment variable handling enhanced"
echo ""
echo "2. 🔧 Environment Variables to set in Vercel:"
echo "   REACT_APP_API_URL=https://ims-iwiz-solutions.onrender.com/api"
echo "   REACT_APP_BACKEND_URL=https://ims-iwiz-solutions.onrender.com"
echo ""
echo "3. 🔧 Environment Variables to set in Render:"
echo "   NODE_ENV=production"
echo "   MONGODB_URI=your_mongodb_connection_string"
echo "   JWT_SECRET=your_jwt_secret"
echo "   JWT_EXPIRE=24h"
echo "   RATE_LIMIT_WINDOW_MS=900000"
echo "   RATE_LIMIT_MAX_REQUESTS=100"
echo "   MAX_FILE_SIZE=10485760"
echo ""
echo "4. ⚠️  Important Notes:"
echo "   - Images will work temporarily until server restart"
echo "   - For permanent solution, implement cloud storage"
echo "   - Check browser console for any URL construction errors"
echo ""
echo "5. 🧪 Testing Steps:"
echo "   - Upload a product image"
echo "   - Check if it displays in product list"
echo "   - Check if it displays in product detail"
echo "   - Upload a user avatar"
echo "   - Check if avatar displays correctly"
echo ""
echo "🎯 Next Steps:"
echo "1. Deploy frontend to Vercel"
echo "2. Deploy backend to Render"
echo "3. Set environment variables"
echo "4. Test image functionality"
echo "5. Consider implementing cloud storage for permanent solution"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "✅ Deployment script completed!"
