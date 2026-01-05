const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Generate UUID using Node.js built-in crypto
const generateId = () => crypto.randomUUID();

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/sites',
    'uploads/tasks',
    'uploads/incidents',
    'uploads/expenses',
    'uploads/workers',
    'uploads/documents',
    'uploads/thumbnails',
    'uploads/profiles'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const entityType = req.params.entityType || 'documents';
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', entityType);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = generateId();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  };

  const allAllowed = [...allowedTypes.image, ...allowedTypes.document];

  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX, XLS, XLSX)'), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 10 // Max 10 files at once
  }
});

// Get file type from mimetype
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('sheet')) return 'document';
  return 'other';
};

// Get file URL
const getFileUrl = (filename, entityType) => {
  return `/uploads/${entityType}/${filename}`;
};

// Delete file
const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, '..', '..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
};

// Profile photo storage
const profilePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'profiles');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = generateId();
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// Profile photo filter (images only)
const profilePhotoFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed for profile photos.'), false);
  }
};

// Profile photo upload configuration
const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  fileFilter: profilePhotoFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max for profile photos
  }
});

module.exports = {
  upload,
  uploadProfilePhoto,
  getFileType,
  getFileUrl,
  deleteFile,
  createUploadDirs
};

