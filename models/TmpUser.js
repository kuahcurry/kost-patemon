const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class TmpUser {
  // Create new temporary user with payment proof
  static async create(tmpData, buktiPembayaranPath) {
    const { Nama, Email, Password, No_telp, Alamat, No_Kamar } = tmpData;

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(Password, 10);

      const query = `
        INSERT INTO tmp (
          Nama, No_telp, Alamat, Email, Password, No_Kamar, 
          Bukti_Pembayaran, Role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'penyewa')
      `;

      const [result] = await pool.execute(query, [
        Nama,
        No_telp,
        Alamat,
        Email,
        hashedPassword,
        No_Kamar,
        buktiPembayaranPath,
      ]);

      // Also create a reservation entry with 'Menunggu' status
      const reservasiQuery = `
        INSERT INTO reservasi (No_Kamar, Email, Tanggal_Reservasi, Status) 
        VALUES (?, ?, NOW(), 'Menunggu')
      `;

      const [reservasiResult] = await pool.execute(reservasiQuery, [
        No_Kamar,
        Email,
      ]);

      return {
        success: true,
        message: "Temporary user and reservation created successfully",
        tmpId: result.insertId,
        reservasiId: reservasiResult.insertId,
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

  // Get all temporary users with their reservation status
  static async getAllWithReservationStatus() {
    try {
      const query = `
        SELECT 
          t.*,
          k.Nama_Kamar,
          k.Letak,
          r.Status as Reservation_Status,
          r.ID_Reservasi,
          r.Tanggal_Reservasi
        FROM tmp t
        JOIN kamar k ON t.No_Kamar = k.No_Kamar
        LEFT JOIN reservasi r ON t.Email = r.Email AND t.No_Kamar = r.No_Kamar
        ORDER BY t.Created_At DESC
      `;

      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get temporary user by ID with reservation status
  static async getByIdWithReservationStatus(id) {
    try {
      const query = `
        SELECT 
          t.*,
          k.Nama_Kamar,
          k.Letak,
          r.Status as Reservation_Status,
          r.ID_Reservasi,
          r.Tanggal_Reservasi
        FROM tmp t
        JOIN kamar k ON t.No_Kamar = k.No_Kamar
        LEFT JOIN reservasi r ON t.Email = r.Email AND t.No_Kamar = r.No_Kamar
        WHERE t.ID_Tmp = ?
      `;

      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Approve tmp user - move to user table and update reservation status
  static async approve(id) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get tmp user data
      const [tmpRows] = await connection.execute(
        "SELECT * FROM tmp WHERE ID_Tmp = ?",
        [id]
      );

      if (tmpRows.length === 0) {
        await connection.rollback();
        return {
          success: false,
          message: "Temporary user not found",
        };
      }

      const tmpUser = tmpRows[0];

      // 1. Create user in users table
      const userQuery = `
        INSERT INTO user (Nama, No_telp, Alamat, Email, Password, Role) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(userQuery, [
        tmpUser.Nama,
        tmpUser.No_telp,
        tmpUser.Alamat,
        tmpUser.Email,
        tmpUser.Password, // Already hashed
        tmpUser.Role,
      ]);

      // 2. Update reservation status to 'Diterima'
      await connection.execute(
        "UPDATE reservasi SET Status = 'Diterima' WHERE Email = ? AND No_Kamar = ?",
        [tmpUser.Email, tmpUser.No_Kamar]
      );

      // 3. Generate temporary token (valid for 1 day)
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); // 1 day from now

      const tokenQuery = `
        INSERT INTO user_tokens (Email, Token, Expires_At) 
        VALUES (?, ?, ?)
      `;

      await connection.execute(tokenQuery, [tmpUser.Email, token, expiresAt]);

      // 4. Update room availability
      await connection.execute(
        "UPDATE kamar SET Ketersediaan = 0 WHERE No_Kamar = ?",
        [tmpUser.No_Kamar]
      );

      // 5. Delete from tmp table
      await connection.execute("DELETE FROM tmp WHERE ID_Tmp = ?", [id]);

      await connection.commit();

      return {
        success: true,
        message: "User approved successfully",
        data: {
          userId: tmpUser.Email,
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

  // Reject tmp user - delete from tmp and update reservation status
  static async reject(id) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get tmp user data
      const [tmpRows] = await connection.execute(
        "SELECT * FROM tmp WHERE ID_Tmp = ?",
        [id]
      );

      if (tmpRows.length === 0) {
        await connection.rollback();
        return {
          success: false,
          message: "Temporary user not found",
        };
      }

      const tmpUser = tmpRows[0];

      // 1. Update reservation status to 'Ditolak'
      await connection.execute(
        "UPDATE reservasi SET Status = 'Ditolak' WHERE Email = ? AND No_Kamar = ?",
        [tmpUser.Email, tmpUser.No_Kamar]
      );

      // 2. Delete from tmp table
      await connection.execute("DELETE FROM tmp WHERE ID_Tmp = ?", [id]);

      await connection.commit();

      return {
        success: true,
        message: "User rejected successfully",
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get tmp user by email
  static async getByEmail(email) {
    try {
      const query = "SELECT * FROM tmp WHERE Email = ?";
      const [rows] = await pool.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TmpUser;
