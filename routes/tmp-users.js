const express = require("express");
const multer = require("multer");
const path = require("path");
const TmpUserController = require("../controllers/TmpUserController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/bukti_pembayaran";
    // Create directory if it doesn't exist
    const fs = require("fs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "bukti-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Public routes
router.post("/", upload.single("buktiPembayaran"), TmpUserController.create);

// Admin only routes
router.get("/", requireAuth, requireAdmin, TmpUserController.getAll);
router.get("/:id", requireAuth, requireAdmin, TmpUserController.getById);
router.put(
  "/:id/approve",
  requireAuth,
  requireAdmin,
  TmpUserController.approve
);
router.put("/:id/reject", requireAuth, requireAdmin, TmpUserController.reject);
router.get(
  "/:id/bukti-pembayaran",
  requireAuth,
  requireAdmin,
  TmpUserController.getBuktiPembayaran
);

module.exports = router;
