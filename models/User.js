const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  // Create new user (Registration)
  static async create(userData) {
    const { Nama, Email, Password, No_telp, Alamat } = userData;

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(Password, 10);

      const query = `
                INSERT INTO user (Nama, No_telp, Alamat, Email, Password, Role) 
                VALUES (?, ?, ?, ?, ?, 'penyewa')
            `;

      const [result] = await pool.execute(query, [
        Nama,
        No_telp,
        Alamat,
        Email,
        hashedPassword,
      ]);

      return {
        success: true,
        message: "User created successfully",
        userId: result.insertId,
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return {
          success: false,
          message: "Email already exists",
        };
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = "SELECT * FROM user WHERE Email = ?";
      const [rows] = await pool.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user profile (without password)
  static async getProfile(email) {
    try {
      const query =
        "SELECT Nama, No_telp, Alamat, Email, Foto, Role FROM user WHERE Email = ?";
      const [rows] = await pool.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(email, updateData) {
    try {
      const { Nama, No_telp, Alamat } = updateData;
      const query = `
                UPDATE user 
                SET Nama = ?, No_telp = ?, Alamat = ? 
                WHERE Email = ?
            `;

      const [result] = await pool.execute(query, [
        Nama,
        No_telp,
        Alamat,
        email,
      ]);

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Profile updated successfully"
            : "User not found",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
