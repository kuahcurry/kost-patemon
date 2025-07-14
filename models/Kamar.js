const { pool } = require("../config/database");

class Kamar {
  // Get all rooms
  static async getAll() {
    try {
      const query = "SELECT * FROM kamar ORDER BY No_Kamar";
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get available rooms
  static async getAvailable() {
    try {
      const query =
        "SELECT * FROM kamar WHERE Ketersediaan = 1 ORDER BY No_Kamar";
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get room by ID
  static async getById(roomId) {
    try {
      const query = "SELECT * FROM kamar WHERE No_Kamar = ?";
      const [rows] = await pool.execute(query, [roomId]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update room availability
  static async updateAvailability(roomId, availability) {
    try {
      const query = "UPDATE kamar SET Ketersediaan = ? WHERE No_Kamar = ?";
      const [result] = await pool.execute(query, [availability, roomId]);

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Room availability updated"
            : "Room not found",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Kamar;
