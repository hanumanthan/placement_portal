const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

// Ensure upload directories exist
const uploadDirs = ['resumes', 'photos', 'logos', 'resources'];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, '../uploads', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Storage configuration with unique randomized filenames
const createStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads', subfolder));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

// File filter: Resumes & Resources (PDFs and documents)
const pdfFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.doc', '.docx'];
  const allowedMime = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  if (allowedExts.includes(ext) || allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and Word documents are permitted.', 400), false);
  }
};

// File filter: Images (PNG, JPG, JPEG, WEBP, SVG)
const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

  if (allowedExts.includes(ext) && allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPG, PNG, WEBP, SVG) are permitted.', 400), false);
  }
};

// Multer upload instances
const uploadResume = multer({
  storage: createStorage('resumes'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: pdfFilter,
});

const uploadPhoto = multer({
  storage: createStorage('photos'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter: imageFilter,
});

const uploadLogo = multer({
  storage: createStorage('logos'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter: imageFilter,
});

const uploadResource = multer({
  storage: createStorage('resources'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: pdfFilter,
});

module.exports = {
  uploadResume,
  uploadPhoto,
  uploadLogo,
  uploadResource,
};
