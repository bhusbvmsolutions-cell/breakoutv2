// routes/admin/virtual-game.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated } = require('../../middlewares/auth');
const VirtualGameController = require('../../controllers/admin/VirtualGame.controller');

const uploadDir = path.join(__dirname, '../../public/uploads/virtual/game');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `game-${uniqueSuffix}${ext}`);
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

router.get('/', VirtualGameController.index);
router.get('/create', VirtualGameController.create);
router.post('/store', uploadAny, VirtualGameController.store);
router.get('/edit/:id', VirtualGameController.edit);
router.post('/update/:id', uploadAny, VirtualGameController.update);
router.get('/view/:id', VirtualGameController.view);
router.delete('/delete/:id', VirtualGameController.delete);
router.post('/toggle-status/:id', VirtualGameController.toggleStatus);

module.exports = router;