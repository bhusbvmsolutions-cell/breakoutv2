const express = require("express");
const router = express.Router();
const BlogController = require("../../controllers/admin/blog.controller");
const { isAuthenticated } = require("../../middlewares/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, "../../public/uploads/blogs");
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files are allowed"));
};

// Create upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter,
});

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Blog routes
router.get("/", BlogController.bloglist);
router.get("/create", BlogController.createForm);
router.post("/", upload.single("heroImage"), BlogController.store);
router.get("/:id", BlogController.show);
router.get("/:id/edit", BlogController.editForm);
router.put("/:id", upload.single("heroImage"), BlogController.update);
router.get("/:id/delete", BlogController.delete);
router.post("/bulk-delete", BlogController.bulkDelete);
router.get("/:id/toggle-status", BlogController.toggleStatus);

// Image upload route for blocks
router.post("/blocks/upload-image", upload.single("image"), (req, res) => {
  if (req.file) {
    res.json({ 
      success: true,
      url: `/uploads/blogs/${req.file.filename}` 
    });
  } else {
    res.status(400).json({ error: "No file uploaded" });
  }
});

module.exports = router;