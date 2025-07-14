const Reservasi = require("../models/Reservasi");

class ReservasiController {
  // Create new reservation
  static async create(req, res) {
    try {
      const reservationData = {
        ...req.body,
        Email: req.user.Email, // Use authenticated user's email
      };

      const result = await Reservasi.create(reservationData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: "Reservation created successfully",
        data: {
          reservationId: result.reservationId,
        },
      });
    } catch (error) {
      console.error("Create reservation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user's reservations
  static async getUserReservations(req, res) {
    try {
      const reservations = await Reservasi.getByUser(req.user.Email);

      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      console.error("Get user reservations error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all reservations (Admin only)
  static async getAll(req, res) {
    try {
      const reservations = await Reservasi.getAll();

      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      console.error("Get all reservations error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update reservation status (Admin only)
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ["Menunggu", "Diterima", "Ditolak"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Must be one of: Menunggu, Diterima, Ditolak",
        });
      }

      const result = await Reservasi.updateStatus(id, status);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Update reservation status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = ReservasiController;
