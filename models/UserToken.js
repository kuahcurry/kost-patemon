const { pool } = require("../config/database");

class UserToken {
  // Verify if token is valid and not expired
  static async verifyToken(token) {
    try {
      const query = `
        SELECT * FROM user_tokens 
        WHERE Token = ? AND Expires_At > NOW() AND Used = 0
      `;

      const [rows] = await pool.execute(query, [token]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Mark token as used
  static async markTokenAsUsed(token) {
    try {
      const query = "UPDATE user_tokens SET Used = 1 WHERE Token = ?";
      const [result] = await pool.execute(query, [token]);

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0 ? "Token marked as used" : "Token not found",
      };
    } catch (error) {
      throw error;
    }
  }

  // Get token by email
  static async getByEmail(email) {
    try {
      const query = `
        SELECT * FROM user_tokens 
        WHERE Email = ? AND Expires_At > NOW() AND Used = 0
        ORDER BY Created_At DESC
        LIMIT 1
      `;

      const [rows] = await pool.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Clean up expired tokens
  static async cleanupExpiredTokens() {
    try {
      const query = "DELETE FROM user_tokens WHERE Expires_At <= NOW()";
      const [result] = await pool.execute(query);

      return {
        success: true,
        deletedCount: result.affectedRows,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all tokens for admin view
  static async getAll() {
    try {
      const query = `
        SELECT 
          ut.*,
          u.Nama
        FROM user_tokens ut
        LEFT JOIN user u ON ut.Email = u.Email
        ORDER BY ut.Created_At DESC
      `;

      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserToken;
