const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated } = require('../../middlewares/auth');
const BachelorFarewellArchiveController = require('../../controllers/admin/BachelorFarewellArchive.controller');

const uploadDirBase = path.join(__dirname, '../../public/uploads/party');
if (!fs.existsSync(uploadDirBase)) fs.mkdirSync(uploadDirBase, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type || 'bachelor';
    const uploadDir = path.join(uploadDirBase, type);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.type}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter });
const uploadAny = upload.any();

router.use(isAuthenticated);

router.get('/:type/archive', BachelorFarewellArchiveController.index);
router.post('/:type/archive', uploadAny, BachelorFarewellArchiveController.update);

module.exports = router;