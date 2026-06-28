const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const uploadPath = path.resolve(__dirname, process.env.UPLOAD_PATH || '../../storage/uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SAFE_SEGMENT_PATTERN = /[^a-zA-Z0-9_-]/g;

const allowedMimeExtensions = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

function sanitizePathSegment(value) {
  const sanitized = String(value || 'general')
    .replace(SAFE_SEGMENT_PATTERN, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);

  return sanitized || 'general';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const year = new Date().getFullYear();
    const dossierId = sanitizePathSegment(req.params.dossierId || req.body.dossier_id);
    const dir = path.join(uploadPath, String(year), String(dossierId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = allowedMimeExtensions[file.mimetype] || path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = Object.keys(allowedMimeExtensions);
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Type de fichier non autorisé'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
    fields: 8,
    parts: 12,
    fieldNameSize: 100,
    fieldSize: 1024 * 1024,
    fieldNestingDepth: 5,
  },
});

module.exports = upload;
