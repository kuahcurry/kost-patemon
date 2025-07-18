const express = require("express");
const router = express.Router();
const KamarController = require("../controllers/KamarController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Public routes
router.get("/", KamarController.getAll);
router.get("/available", KamarController.getAvailable);
router.get("/:id", KamarController.getById);

// Admin routes (protected + admin only)
router.put(
  "/:id/availability",
  authenticateToken,
  requireAdmin,
  KamarController.updateAvailability
);

module.exports = router;
