const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const escapeRoomArchiveController = require("../../controllers/admin/escapeRoomArchive.controller");
const { isAuthenticated } = require("../../middlewares/auth");

// Ensure single upload directory exists for all escaperoom archives
const uploadDir = path.join(__dirname, "../../public/uploads/escaperoomarchive");
  
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the same directory for all files
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    // Include fieldname in filename to identify file type
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff|tif|svg|ico|heif|heic|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed!"));
  }
};

// Multer upload instance for escape room
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 5MB limit
  }
});

// Apply authentication middleware to all admin routes
router.use(isAuthenticated);

// Escape Room Archive routes
router.get("/archive", escapeRoomArchiveController.getArchive);

router.post("/archive", 
  upload.fields([
    { name: "banner_image", maxCount: 1 },
    { name: "icon_images", maxCount: 20 },
    { name: "counter_images", maxCount: 20 },
    { name: "gallery_images", maxCount: 30 }
  ]),
  (err, req, res, next) => {
    // Multer error handling middleware
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        req.flash("error", "File too large. Maximum size is 50MB");
      } else if (err.code === "LIMIT_FILE_COUNT") {
        req.flash("error", "Too many files uploaded");
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        req.flash("error", "Unexpected field name");
      } else {
        req.flash("error", `Upload error: ${err.message}`);
      }
      return res.redirect("/admin/escape/archive");
    } else if (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/escape/archive");
    }
    next();
  },
  escapeRoomArchiveController.updateArchive
);

// Delete routes (AJAX)
router.delete("/archive/image/:id", escapeRoomArchiveController.deleteImage);
router.delete("/archive/icon/:id", escapeRoomArchiveController.deleteIcon);
router.delete("/archive/counter/:id", escapeRoomArchiveController.deleteCounter);

module.exports = router;