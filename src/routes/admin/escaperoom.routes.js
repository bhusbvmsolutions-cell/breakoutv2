const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const escapeRoomController = require('../../controllers/admin/escapeRoom.controller');
const {isAuthenticated} = require('../../middlewares/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/uploads/escaperooms');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'room-' + uniqueSuffix + ext);
    }
});

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
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Apply auth middleware to all routes
router.use(isAuthenticated);

// Image upload route
router.post('/upload', upload.single('image'), escapeRoomController.uploadImage);
router.get('/recent-images', escapeRoomController.getRecentImages);

// CRUD routes
router.get('/', escapeRoomController.index);
router.get('/add', escapeRoomController.add);
router.get('/edit/:id', escapeRoomController.edit);
router.get('/:id', escapeRoomController.show);

router.post('/', 
    upload.fields([
        { name: 'banner_image', maxCount: 1 },
        { name: 'gallery_images', maxCount: 10 }
    ]), 
    escapeRoomController.create
);

router.put('/:id', 
    upload.fields([
        { name: 'banner_image', maxCount: 1 },
        { name: 'gallery_images', maxCount: 10 }
    ]), 
    escapeRoomController.update
);

router.delete('/:id', escapeRoomController.delete);

module.exports = router;