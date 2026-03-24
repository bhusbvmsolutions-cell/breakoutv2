const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated } = require('../../middlewares/auth');
const LocationController = require('../../controllers/admin/Location.controller');

const uploadDir = path.join(__dirname, '../../public/uploads/location');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `location-${uniqueSuffix}${ext}`);
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

router.get('/', LocationController.index);
router.get('/create', LocationController.create);
router.post('/store', uploadAny, LocationController.store);
router.get('/edit/:id', LocationController.edit);
router.post('/update/:id', uploadAny, LocationController.update);
router.get('/view/:id', LocationController.view);
router.delete('/delete/:id', LocationController.delete);
router.post('/toggle-status/:id', LocationController.toggleStatus);

module.exports = router;