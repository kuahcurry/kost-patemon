const PendingReservation = require("../models/PendingReservation");
const UserToken = require("../models/UserToken");
const path = require("path");
const fs = require("fs");

class PendingReservasiController {
  // Create new pending reservation with payment proof
  static async create(req, res) {
    try {
      const pendingData = req.body;

      // Check if bukti pembayaran file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Bukti pembayaran is required",
        });
      }

      const buktiPembayaranPath = req.file.path;

      const result = await PendingReservation.create(
        pendingData,
        buktiPembayaranPath
      );

      if (!result.success) {
        // Delete uploaded file if reservation creation failed
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
          pendingId: result.pendingId,
        },
      });
    } catch (error) {
      console.error("Create pending reservation error:", error);

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

  // Get all pending reservations (Admin only)
  static async getAll(req, res) {
    try {
      const pendingReservations = await PendingReservation.getAll();

      res.json({
        success: true,
        data: pendingReservations,
      });
    } catch (error) {
      console.error("Get all pending reservations error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get pending reservation by ID (Admin only)
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const pendingReservation = await PendingReservation.getById(id);

      if (!pendingReservation) {
        return res.status(404).json({
          success: false,
          message: "Pending reservation not found",
        });
      }

      res.json({
        success: true,
        data: pendingReservation,
      });
    } catch (error) {
      console.error("Get pending reservation by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Approve pending reservation (Admin only)
  static async approve(req, res) {
    try {
      const { id } = req.params;

      const result = await PendingReservation.approve(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message:
          "Reservasi berhasil disetujui! User dapat login menggunakan token yang telah diberikan.",
        data: result.data,
      });
    } catch (error) {
      console.error("Approve pending reservation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Reject pending reservation (Admin only)
  static async reject(req, res) {
    try {
      const { id } = req.params;

      const result = await PendingReservation.reject(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: "Reservasi telah ditolak.",
      });
    } catch (error) {
      console.error("Reject pending reservation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete pending reservation (Admin only)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Get pending reservation to delete associated file
      const pendingReservation = await PendingReservation.getById(id);

      const result = await PendingReservation.delete(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      // Delete associated bukti pembayaran file
      if (pendingReservation && pendingReservation.Bukti_Pembayaran) {
        const filePath = pendingReservation.Bukti_Pembayaran;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.json({
        success: true,
        message: "Pending reservation deleted successfully",
      });
    } catch (error) {
      console.error("Delete pending reservation error:", error);
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

      const pendingReservation = await PendingReservation.getById(id);

      if (!pendingReservation || !pendingReservation.Bukti_Pembayaran) {
        return res.status(404).json({
          success: false,
          message: "Bukti pembayaran not found",
        });
      }

      const filePath = pendingReservation.Bukti_Pembayaran;

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }

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

module.exports = PendingReservasiController;
