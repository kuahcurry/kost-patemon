const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");
const { handleUpload } = require("../middleware/upload");

// Public routes
router.post("/register", validateRegistration, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.post("/login-token", AuthController.loginWithToken); // New token-based login

// Protected routes
router.get("/profile", authenticateToken, AuthController.getProfile);
router.put(
  "/profile",
  authenticateToken,
  handleUpload,
  AuthController.updateProfile
);
router.put(
  "/change-password",
  authenticateToken,
  AuthController.changePassword
);

module.exports = router;
