const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAuthenticated } = require('../../middlewares/auth');
const LandingController = require('../../controllers/admin/landing.controller');


// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/uploads/landing');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'landing-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Dynamic fields middleware
const landingUpload = upload.any();

// Apply auth middleware
router.use(isAuthenticated);

// Routes
router.get('/', LandingController.index);
router.get('/create', LandingController.create);
router.post('/store', landingUpload, LandingController.store);
router.get('/edit/:id', LandingController.edit);
router.post('/update/:id', landingUpload, LandingController.update);
router.get('/view/:id', LandingController.view);
router.delete('/delete/:id', LandingController.delete);
router.post('/toggle-status/:id', LandingController.toggleStatus);
router.get('/check-slug', LandingController.checkSlug);

module.exports = router;