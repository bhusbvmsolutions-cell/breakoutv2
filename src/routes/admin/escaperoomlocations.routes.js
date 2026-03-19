const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const escapeRoomLocationController = require("../../controllers/admin/escapeRoomLocation.controller");
const { isAuthenticated } = require("../../middlewares/auth");

// Ensure upload directory exists for escape room locations
const uploadDir = path.join(__dirname, "../../public/uploads/escaperoomlocations");
  
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage for locations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    // Include fieldname in filename to identify file type
    cb(null, "location-" + file.fieldname + "-" + uniqueSuffix + ext);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed!"));
  }
};

// Multer upload instance for locations
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Apply authentication middleware to all admin routes
router.use(isAuthenticated);

// ============ Escape Room Location Routes ============

// List all locations
router.get("/", escapeRoomLocationController.list);

// Create form
router.get("/create", escapeRoomLocationController.createForm);

// Edit form
router.get("/edit/:id", escapeRoomLocationController.editForm);

// Create location with file uploads
router.post("/", 
  upload.fields([
    { name: "banner_featured_image", maxCount: 1 },
    { name: "image_card_images", maxCount: 20 }
  ]),
  (err, req, res, next) => {
    // Multer error handling middleware
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        req.flash("error", "File too large. Maximum size is 5MB");
      } else if (err.code === "LIMIT_FILE_COUNT") {
        req.flash("error", "Too many files uploaded");
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        req.flash("error", "Unexpected field name");
      } else {
        req.flash("error", `Upload error: ${err.message}`);
      }
      return res.redirect("/admin/escape/locations/create");
    } else if (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/escape/locations/create");
    }
    next();
  },
  escapeRoomLocationController.create
);

// Update location
router.post("/:id", 
  upload.fields([
    { name: "banner_featured_image", maxCount: 1 },
    { name: "image_card_images", maxCount: 20 }
  ]),
  (err, req, res, next) => {
    // Multer error handling middleware
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        req.flash("error", "File too large. Maximum size is 5MB");
      } else if (err.code === "LIMIT_FILE_COUNT") {
        req.flash("error", "Too many files uploaded");
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        req.flash("error", "Unexpected field name");
      } else {
        req.flash("error", `Upload error: ${err.message}`);
      }
      return res.redirect(`/admin/escape/locations/edit/${req.params.id}`);
    } else if (err) {
      req.flash("error", err.message);
      return res.redirect(`/admin/escape/locations/edit/${req.params.id}`);
    }
    next();
  },
  escapeRoomLocationController.update
);

// Support PUT method via query parameter
router.put("/:id", escapeRoomLocationController.update);

// Delete location
router.delete("/:id", escapeRoomLocationController.delete);

// Delete image card
router.delete("/image-card/:id", escapeRoomLocationController.deleteImageCard);

module.exports = router;