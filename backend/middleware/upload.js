const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created upload directory: ${dirPath}`);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on file type
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'productImages') {
      uploadPath += 'products/';
    } else if (file.fieldname === 'documents') {
      uploadPath += 'documents/';
    } else {
      uploadPath += 'misc/';
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and random suffix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);
    
    const filename = baseName + '-' + uniqueSuffix + extension;
    console.log(`Generated filename: ${filename} for ${file.originalname}`);
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocumentTypes = /pdf|doc|docx|xls|xlsx|txt/;
  
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedDocumentTypes.test(path.extname(file.originalname).toLowerCase());
  
  const mimetype = /image\/(jpeg|jpg|png|gif|webp)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet))|text\/plain/
    .test(file.mimetype);

  if (mimetype && extname) {
    console.log(`File accepted: ${file.originalname} (${file.mimetype})`);
    return cb(null, true);
  } else {
    console.log(`File rejected: ${file.originalname} (${file.mimetype})`);
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX, XLS, XLSX, TXT) are allowed.'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000, // 5MB default
    files: 10 // Maximum 10 files per request
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum file size is 5MB.',
        error: error.message
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 10 files allowed.',
        error: error.message
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field.',
        error: error.message
      });
    }
    
    return res.status(400).json({
      message: 'File upload error',
      error: error.message
    });
  }
  
  if (error) {
    console.error('Upload error:', error);
    return res.status(400).json({
      message: 'File upload failed',
      error: error.message
    });
  }
  
  next(error);
};

// Specific upload configurations
const uploadConfigs = {
  // Single avatar upload
  avatar: upload.single('avatar'),
  
  // Multiple product images (max 5)
  productImages: upload.array('productImages', 5),
  
  // Multiple documents (max 10)
  documents: upload.array('documents', 10),
  
  // Mixed fields
  mixed: upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'productImages', maxCount: 5 },
    { name: 'documents', maxCount: 10 }
  ])
};

// Utility function to get file URL
const getFileUrl = (filename, type = 'product') => {
  if (!filename) return null;
  
  // If it's already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If it's already a relative path, return as is
  if (filename.startsWith('/uploads/')) {
    return filename;
  }
  
  // Construct the path based on type
  if (type === 'avatar') {
    return `/uploads/avatars/${filename}`;
  } else if (type === 'product') {
    return `/uploads/products/${filename}`;
  } else if (type === 'document') {
    return `/uploads/documents/${filename}`;
  }
  
  return `/uploads/misc/${filename}`;
};

// Utility function to validate file exists
const validateFileExists = (filePath) => {
  if (!filePath) return false;
  
  const fullPath = path.join(process.cwd(), filePath.startsWith('/') ? filePath.slice(1) : filePath);
  return fs.existsSync(fullPath);
};

module.exports = {
  upload,
  uploadConfigs,
  handleMulterError,
  getFileUrl,
  validateFileExists
};