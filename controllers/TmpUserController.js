const TmpUser = require("../models/TmpUser");
const UserToken = require("../models/UserToken");
const path = require("path");
const fs = require("fs");

class TmpUserController {
  // Create new tmp user with payment proof
  static async create(req, res) {
    try {
      const tmpData = req.body;

      // Check if bukti pembayaran file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Bukti pembayaran is required",
        });
      }

      const buktiPembayaranPath = req.file.path;

      const result = await TmpUser.create(tmpData, buktiPembayaranPath);

      if (!result.success) {
        // Delete uploaded file if creation failed
        if (fs.existsSync(buktiPembayaranPath)) {
          fs.unlinkSync(buktiPembayaranPath);
        }
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message:
          "Reservasi berhasil dikirim! Silakan menunggu konfirmasi admin.",
        data: {
          tmpId: result.tmpId,
          reservasiId: result.reservasiId,
        },
      });
    } catch (error) {
      console.error("Create tmp user error:", error);

      // Delete uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all tmp users with reservation status (Admin only)
  static async getAll(req, res) {
    try {
      const tmpUsers = await TmpUser.getAllWithReservationStatus();

      res.json({
        success: true,
        data: tmpUsers,
      });
    } catch (error) {
      console.error("Get all tmp users error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get tmp user by ID (Admin only)
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const tmpUser = await TmpUser.getByIdWithReservationStatus(id);

      if (!tmpUser) {
        return res.status(404).json({
          success: false,
          message: "Temporary user not found",
        });
      }

      res.json({
        success: true,
        data: tmpUser,
      });
    } catch (error) {
      console.error("Get tmp user by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Approve tmp user (Admin only)
  static async approve(req, res) {
    try {
      const { id } = req.params;

      const result = await TmpUser.approve(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: "User berhasil disetujui! Token telah dibuat untuk login.",
        data: result.data,
      });
    } catch (error) {
      console.error("Approve tmp user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Reject tmp user (Admin only)
  static async reject(req, res) {
    try {
      const { id } = req.params;

      const result = await TmpUser.reject(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: "User telah ditolak.",
      });
    } catch (error) {
      console.error("Reject tmp user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Serve bukti pembayaran image (Admin only)
  static async getBuktiPembayaran(req, res) {
    try {
      const { id } = req.params;

      const tmpUser = await TmpUser.getByIdWithReservationStatus(id);

      if (!tmpUser || !tmpUser.Bukti_Pembayaran) {
        console.log("Bukti pembayaran not found for ID:", id);
        console.log("TmpUser data:", tmpUser);
        return res.status(404).json({
          success: false,
          message: "Bukti pembayaran not found",
        });
      }

      const filePath = tmpUser.Bukti_Pembayaran;
      console.log("Trying to serve file:", filePath);

      if (!fs.existsSync(filePath)) {
        console.log("File does not exist:", filePath);
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }

      console.log("Serving file:", filePath);
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      console.error("Get bukti pembayaran error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = TmpUserController;
