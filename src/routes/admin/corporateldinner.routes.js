// routes/admin/corporate-ld-inner.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated } = require('../../middlewares/auth');
const CorporateLdInnerPageController = require('../../controllers/admin/CorporateLdInnerPage.controller');

const uploadDir = path.join(__dirname, '../../public/uploads/corporate-ld-inner');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `corporate-ld-inner-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff|tif|svg|ico|heif|heic|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter });
const uploadAny = upload.any();

router.use(isAuthenticated);

router.get('/', CorporateLdInnerPageController.index);
router.get('/create', CorporateLdInnerPageController.create);
router.post('/store', uploadAny, CorporateLdInnerPageController.store);
router.get('/edit/:id', CorporateLdInnerPageController.edit);
router.post('/update/:id', uploadAny, CorporateLdInnerPageController.update);
router.get('/view/:id', CorporateLdInnerPageController.view);
router.delete('/delete/:id', CorporateLdInnerPageController.delete);
router.post('/toggle-status/:id', CorporateLdInnerPageController.toggleStatus);

module.exports = router;