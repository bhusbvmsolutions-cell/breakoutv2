// routes/admin/birthday-inner.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated } = require('../../middlewares/auth');
const BirthdayInnerPageController = require('../../controllers/admin/BirthdayInnerPage.controller');

const uploadDir = path.join(__dirname, '../../public/uploads/birthday-inner');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `birthday-${uniqueSuffix}${ext}`);
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

router.get('/', BirthdayInnerPageController.index);
router.get('/create', BirthdayInnerPageController.create);
router.post('/store', uploadAny, BirthdayInnerPageController.store);
router.get('/edit/:id', BirthdayInnerPageController.edit);
router.post('/update/:id', uploadAny, BirthdayInnerPageController.update);
router.get('/view/:id', BirthdayInnerPageController.view);
router.delete('/delete/:id', BirthdayInnerPageController.delete);
router.post('/toggle-status/:id', BirthdayInnerPageController.toggleStatus);

module.exports = router;