// routes/admin.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const SiteSettingsController = require("../../controllers/admin/siteSettingsController");
const { isAuthenticated } = require("../../middlewares/auth");

// Ensure upload directories exist
const uploadDir = path.join(__dirname, "../../public/uploads/settings");
const logosDir = path.join(uploadDir, "logos");
const faviconsDir = path.join(uploadDir, "favicons");

[uploadDir, logosDir, faviconsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "siteLogo") {
      cb(null, logosDir);
    } else if (file.fieldname === "siteFavicon") {
      cb(null, faviconsDir);
    } else {
      cb(new Error("Invalid field name"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "siteLogo") {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype.split("/")[1]);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files (JPEG, JPG, PNG, GIF, WEBP, SVG) are allowed for logo"
        )
      );
    }
  } else if (file.fieldname === "siteFavicon") {
    const allowedTypes = /jpeg|jpg|png|ico/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype.split("/")[1]);

    if (
      extname &&
      (mimetype ||
        file.mimetype === "image/x-icon" ||
        file.mimetype === "image/vnd.microsoft.icon")
    ) {
      return cb(null, true);
    } else {
      cb(new Error("Only ICO, PNG, and JPG files are allowed for favicon"));
    }
  } else {
    cb(new Error("Unexpected field"));
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 2,
  },
});

// Apply authentication middleware to all admin routes
router.use(isAuthenticated);

// Site Settings routes
router.get("/settings", SiteSettingsController.editForm);

router.post(
  "/settings/update",
  upload.fields([
    { name: "siteLogo", maxCount: 1 },
    { name: "siteFavicon", maxCount: 1 },
  ]),
  (err, req, res, next) => {
    // Multer error handling middleware
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        req.flash("error", "File too large. Maximum size is 2MB");
      } else if (err.code === "LIMIT_FILE_COUNT") {
        req.flash("error", "Too many files uploaded");
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        req.flash("error", "Unexpected field name");
      } else {
        req.flash("error", `Upload error: ${err.message}`);
      }
      return res.redirect("/admin/settings");
    } else if (err) {
      req.flash("error", err.message);
      return res.redirect("/admin/settings");
    }
    next();
  },
  SiteSettingsController.update
);

module.exports = router;
