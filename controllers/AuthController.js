const User = require("../models/User");
const jwt = require("jsonwebtoken");

class AuthController {
  // User Registration
  static async register(req, res) {
    try {
      const result = await User.create(req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          userId: result.userId,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // User Login
  static async login(req, res) {
    try {
      const { Email, Password } = req.body;

      // Find user
      const user = await User.findByEmail(Email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(
        Password,
        user.Password
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { email: user.Email, role: user.Role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            nama: user.Nama,
            email: user.Email,
            role: user.Role,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get User Profile
  static async getProfile(req, res) {
    try {
      const profile = await User.getProfile(req.user.Email);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update User Profile
  static async updateProfile(req, res) {
    try {
      const result = await User.updateProfile(req.user.Email, req.body);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = AuthController;
