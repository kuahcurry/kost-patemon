const express = require("express");
const router = express.Router();
const ReservasiController = require("../controllers/ReservasiController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { validateReservation } = require("../middleware/validation");

// User routes (protected)
router.post(
  "/",
  authenticateToken,
  validateReservation,
  ReservasiController.create
);
router.get(
  "/my-reservations",
  authenticateToken,
  ReservasiController.getUserReservations
);

// Admin routes (protected + admin only)
router.get("/all", authenticateToken, requireAdmin, ReservasiController.getAll);
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  ReservasiController.updateStatus
);

module.exports = router;
