const Kamar = require("../models/Kamar");

class KamarController {
  // Get all rooms
  static async getAll(req, res) {
    try {
      const rooms = await Kamar.getAll();

      res.json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      console.error("Get all rooms error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get available rooms
  static async getAvailable(req, res) {
    try {
      const rooms = await Kamar.getAvailable();

      res.json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      console.error("Get available rooms error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get room by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const room = await Kamar.getById(id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      res.json({
        success: true,
        data: room,
      });
    } catch (error) {
      console.error("Get room by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update room availability (Admin only)
  static async updateAvailability(req, res) {
    try {
      const { id } = req.params;
      const { availability } = req.body;

      // Validate availability
      if (availability !== 0 && availability !== 1) {
        return res.status(400).json({
          success: false,
          message: "Availability must be 0 (not available) or 1 (available)",
        });
      }

      const result = await Kamar.updateAvailability(id, availability);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Update room availability error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = KamarController;
