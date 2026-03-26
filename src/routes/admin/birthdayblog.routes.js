const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated } = require('../../middlewares/auth');
const BirthdayBlogController = require('../../controllers/admin/BirthdayBlog.controller');
const BirthdayBlogVenueMappingController = require('../../controllers/admin/BirthdayBlogVenueMapping.controller');

const uploadDir = path.join(__dirname, '../../public/uploads/birthday-blog');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `blog-${uniqueSuffix}${ext}`);
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

router.get('/', BirthdayBlogController.index);
router.get('/create', BirthdayBlogController.create);
router.post('/store', uploadAny, BirthdayBlogController.store);
router.get('/edit/:id', BirthdayBlogController.edit);
router.post('/update/:id', uploadAny, BirthdayBlogController.update);
router.get('/view/:id', BirthdayBlogController.view);
router.delete('/delete/:id', BirthdayBlogController.delete);
router.post('/toggle-status/:id', BirthdayBlogController.toggleStatus);



// Venue mappings routes
router.get('/:blogId/venue-mappings', BirthdayBlogVenueMappingController.list);
router.get('/:blogId/venue-mappings/create', BirthdayBlogVenueMappingController.create);
router.post('/venue-mappings/store', BirthdayBlogVenueMappingController.store);
router.get('/venue-mappings/edit/:id', BirthdayBlogVenueMappingController.edit);
router.post('/venue-mappings/update/:id', BirthdayBlogVenueMappingController.update);
router.delete('/venue-mappings/delete/:id', BirthdayBlogVenueMappingController.delete);
router.post('/venue-mappings/toggle-status/:id', BirthdayBlogVenueMappingController.toggleStatus);



module.exports = router;