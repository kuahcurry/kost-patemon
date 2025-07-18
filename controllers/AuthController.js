const User = require("../models/User");
const UserToken = require("../models/UserToken");
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

  // Token-based login for approved reservations
  static async loginWithToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        });
      }

      // Verify token
      const tokenData = await UserToken.verifyToken(token);
      if (!tokenData) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      // Find user
      const user = await User.findByEmail(tokenData.Email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Mark token as used
      await UserToken.markTokenAsUsed(token);

      // Generate JWT token
      const jwtToken = jwt.sign(
        { email: user.Email, role: user.Role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token: jwtToken,
          user: {
            nama: user.Nama,
            email: user.Email,
            role: user.Role,
          },
        },
      });
    } catch (error) {
      console.error("Token login error:", error);
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
      const updateData = { ...req.body };

      // If file was uploaded, add file path to update data
      if (req.file) {
        // Store relative path for frontend access
        updateData.Foto = `/uploads/profiles/${req.file.filename}`;
      }

      const result = await User.updateProfile(req.user.Email, updateData);

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

  // Change Password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Semua field password harus diisi",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Password baru dan konfirmasi password tidak sama",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password baru minimal 6 karakter",
        });
      }

      const result = await User.changePassword(
        req.user.Email,
        currentPassword,
        newPassword
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = AuthController;
