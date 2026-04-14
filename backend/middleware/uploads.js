const fs = require('fs');
const path = require('path');
const multer = require('multer');

const backendRoot = path.join(__dirname, '..');
const uploadsRoot = path.join(backendRoot, 'uploads');

const ensureDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

const sanitizeFileName = (originalName) => {
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return `${baseName || 'upload'}${extension}`;
};

const createStorage = (folderName) => {
  const destination = path.join(uploadsRoot, folderName);
  ensureDirectory(destination);

  return multer.diskStorage({
    destination(req, file, cb) {
      cb(null, destination);
    },
    filename(req, file, cb) {
      const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniquePrefix}-${sanitizeFileName(file.originalname)}`);
    }
  });
};

const createUpload = ({ folderName, mimePrefix, maxFileSize, label }) => multer({
  storage: createStorage(folderName),
  limits: { fileSize: maxFileSize },
  fileFilter(req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith(mimePrefix)) {
      cb(null, true);
      return;
    }

    cb(new Error(`Only ${label} files are allowed.`));
  }
});

const buildUploadedFileUrl = (req, file) => {
  const relativePath = path.relative(backendRoot, file.path).replace(/\\/g, '/');
  return `${req.protocol}://${req.get('host')}/${relativePath}`;
};

module.exports = {
  imageUpload: createUpload({
    folderName: 'images',
    mimePrefix: 'image/',
    maxFileSize: 5 * 1024 * 1024,
    label: 'image'
  }),
  reelUpload: createUpload({
    folderName: 'reels',
    mimePrefix: 'video/',
    maxFileSize: 50 * 1024 * 1024,
    label: 'video'
  }),
  buildUploadedFileUrl
};
