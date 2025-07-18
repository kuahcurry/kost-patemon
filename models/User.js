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
      const { Nama, No_telp, Alamat, Foto } = updateData;

      // Build dynamic query based on what fields are being updated
      let setClause = [];
      let queryParams = [];

      if (Nama !== undefined) {
        setClause.push("Nama = ?");
        queryParams.push(Nama);
      }

      if (No_telp !== undefined) {
        setClause.push("No_telp = ?");
        queryParams.push(No_telp);
      }

      if (Alamat !== undefined) {
        setClause.push("Alamat = ?");
        queryParams.push(Alamat);
      }

      if (Foto !== undefined) {
        setClause.push("Foto = ?");
        queryParams.push(Foto);
      }

      if (setClause.length === 0) {
        return {
          success: false,
          message: "No valid fields to update",
        };
      }

      const query = `UPDATE user SET ${setClause.join(", ")} WHERE Email = ?`;
      queryParams.push(email);

      const [result] = await pool.execute(query, queryParams);

      if (result.affectedRows > 0) {
        // Return updated user data
        const updatedUser = await this.findByEmail(email);
        return {
          success: true,
          message: "Profile updated successfully",
          data: {
            Nama: updatedUser.Nama,
            Email: updatedUser.Email,
            No_telp: updatedUser.No_telp,
            Alamat: updatedUser.Alamat,
            Foto: updatedUser.Foto,
            Role: updatedUser.Role,
          },
        };
      } else {
        return {
          success: false,
          message: "User not found",
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // Change user password
  static async changePassword(email, currentPassword, newPassword) {
    try {
      // Get current user data
      const user = await this.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(
        currentPassword,
        user.Password
      );
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: "Password lama tidak benar",
        };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      const query = "UPDATE user SET Password = ? WHERE Email = ?";
      const [result] = await pool.execute(query, [hashedNewPassword, email]);

      if (result.affectedRows > 0) {
        return {
          success: true,
          message: "Password berhasil diubah",
        };
      } else {
        return {
          success: false,
          message: "Gagal mengubah password",
        };
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
