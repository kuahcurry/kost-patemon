const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class PendingReservation {
  // Create new pending reservation with payment proof
  static async create(pendingData, buktiPembayaranPath) {
    const {
      Nama,
      Email,
      Password,
      No_telp,
      Alamat,
      No_Kamar,
      Tanggal_Reservasi,
    } = pendingData;

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(Password, 10);

      const query = `
        INSERT INTO pending_reservations (
          Nama, No_telp, Alamat, Email, Password, No_Kamar, 
          Tanggal_Reservasi, Bukti_Pembayaran, Status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu')
      `;

      const [result] = await pool.execute(query, [
        Nama,
        No_telp,
        Alamat,
        Email,
        hashedPassword,
        No_Kamar,
        Tanggal_Reservasi,
        buktiPembayaranPath,
      ]);

      return {
        success: true,
        message: "Pending reservation created successfully",
        pendingId: result.insertId,
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return {
          success: false,
          message: "Email already has a pending reservation",
        };
      }
      throw error;
    }
  }

  // Get all pending reservations (Admin only)
  static async getAll() {
    try {
      const query = `
        SELECT 
          pr.*,
          k.Nama_Kamar,
          k.Letak
        FROM pending_reservations pr
        JOIN kamar k ON pr.No_Kamar = k.No_Kamar
        ORDER BY pr.Created_At DESC
      `;

      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get pending reservation by ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          pr.*,
          k.Nama_Kamar,
          k.Letak
        FROM pending_reservations pr
        JOIN kamar k ON pr.No_Kamar = k.No_Kamar
        WHERE pr.ID_Pending = ?
      `;

      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Approve pending reservation and create user + reservation
  static async approve(id) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get pending reservation data
      const [pendingRows] = await connection.execute(
        "SELECT * FROM pending_reservations WHERE ID_Pending = ? AND Status = 'Menunggu'",
        [id]
      );

      if (pendingRows.length === 0) {
        await connection.rollback();
        return {
          success: false,
          message: "Pending reservation not found or already processed",
        };
      }

      const pending = pendingRows[0];

      // 1. Create user in users table
      const userQuery = `
        INSERT INTO user (Nama, No_telp, Alamat, Email, Password, Role) 
        VALUES (?, ?, ?, ?, ?, 'penyewa')
      `;

      await connection.execute(userQuery, [
        pending.Nama,
        pending.No_telp,
        pending.Alamat,
        pending.Email,
        pending.Password, // Already hashed
      ]);

      // 2. Create reservation
      const reservasiQuery = `
        INSERT INTO reservasi (No_Kamar, Email, Tanggal_Reservasi, Status) 
        VALUES (?, ?, ?, 'Diterima')
      `;

      const [reservasiResult] = await connection.execute(reservasiQuery, [
        pending.No_Kamar,
        pending.Email,
        pending.Tanggal_Reservasi,
      ]);

      // 3. Generate temporary token (valid for 1 day)
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); // 1 day from now

      const tokenQuery = `
        INSERT INTO user_tokens (Email, Token, Expires_At) 
        VALUES (?, ?, ?)
      `;

      await connection.execute(tokenQuery, [pending.Email, token, expiresAt]);

      // 4. Update pending reservation status
      await connection.execute(
        "UPDATE pending_reservations SET Status = 'Diterima' WHERE ID_Pending = ?",
        [id]
      );

      // 5. Update room availability
      await connection.execute(
        "UPDATE kamar SET Ketersediaan = 0 WHERE No_Kamar = ?",
        [pending.No_Kamar]
      );

      await connection.commit();

      return {
        success: true,
        message: "Reservation approved successfully",
        data: {
          userId: pending.Email,
          reservasiId: reservasiResult.insertId,
          token: token,
          expiresAt: expiresAt,
        },
      };
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") {
        return {
          success: false,
          message: "User with this email already exists",
        };
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  // Reject pending reservation
  static async reject(id) {
    try {
      const query =
        "UPDATE pending_reservations SET Status = 'Ditolak' WHERE ID_Pending = ? AND Status = 'Menunggu'";
      const [result] = await pool.execute(query, [id]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Pending reservation not found or already processed",
        };
      }

      return {
        success: true,
        message: "Reservation rejected successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete pending reservation
  static async delete(id) {
    try {
      const query = "DELETE FROM pending_reservations WHERE ID_Pending = ?";
      const [result] = await pool.execute(query, [id]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Pending reservation not found",
        };
      }

      return {
        success: true,
        message: "Pending reservation deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PendingReservation;
