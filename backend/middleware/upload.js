const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploadDirectories = () => {
  const dirs = ['uploads/avatars', 'uploads/products'];
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

createUploadDirectories();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'images') {
      uploadPath += 'products/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);
    
    const filename = baseName + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const uploadConfigs = {
  avatar: upload.single('avatar'),
  productImages: upload.array('images', 5)
};

const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 5 files.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field.' });
    }
    return res.status(400).json({ message: 'File upload error.' });
  }
  
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  
  next();
};

const getFileUrl = (filename, type = 'product') => {
  if (!filename) return null;
  
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://ims-iwiz-solutions.onrender.com'
    : 'http://localhost:5000';
  
  const uploadPath = type === 'avatar' ? 'avatars' : 'products';
  return `${baseUrl}/uploads/${uploadPath}/${filename}`;
};

const validateFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

module.exports = {
  upload,
  uploadConfigs,
  handleMulterError,
  getFileUrl,
  validateFileExists
};