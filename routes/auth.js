const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");

// Public routes
router.post("/register", validateRegistration, AuthController.register);
router.post("/login", validateLogin, AuthController.login);

// Protected routes
router.get("/profile", authenticateToken, AuthController.getProfile);
router.put("/profile", authenticateToken, AuthController.updateProfile);

module.exports = router;
