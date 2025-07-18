const { pool } = require('../config/database');

class Reservasi {
    // Create new reservation
    static async create(reservationData) {
        const { No_Kamar, Email, Tanggal_Reservasi } = reservationData;
        
        try {
            // Check if room is available
            const roomQuery = 'SELECT Ketersediaan FROM kamar WHERE No_Kamar = ?';
            const [roomRows] = await pool.execute(roomQuery, [No_Kamar]);
            
            if (roomRows.length === 0) {
                return {
                    success: false,
                    message: 'Room not found'
                };
            }
            
            if (roomRows[0].Ketersediaan === 0) {
                return {
                    success: false,
                    message: 'Room is not available'
                };
            }
            
            // Create reservation
            const query = `
                INSERT INTO reservasi (No_Kamar, Email, Tanggal_Reservasi, Status) 
                VALUES (?, ?, ?, 'Menunggu')
            `;
            
            const [result] = await pool.execute(query, [
                No_Kamar, Email, Tanggal_Reservasi
            ]);
            
            return {
                success: true,
                message: 'Reservation created successfully',
                reservationId: result.insertId
            };
        } catch (error) {
            throw error;
        }
    }

    // Get user reservations
    static async getByUser(email) {
        try {
            const query = `
                SELECT r.*, k.Nama_Kamar, k.Letak 
                FROM reservasi r 
                JOIN kamar k ON r.No_Kamar = k.No_Kamar 
                WHERE r.Email = ?
                ORDER BY r.Tanggal_Reservasi DESC
            `;
            
            const [rows] = await pool.execute(query, [email]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get all reservations (for admin)
    static async getAll() {
        try {
            const query = `
                SELECT r.*, k.Nama_Kamar, k.Letak, u.Nama as Nama_User
                FROM reservasi r 
                JOIN kamar k ON r.No_Kamar = k.No_Kamar 
                JOIN user u ON r.Email = u.Email
                ORDER BY r.Tanggal_Reservasi DESC
            `;
            
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Update reservation status (for admin)
    static async updateStatus(reservationId, status) {
        try {
            const query = 'UPDATE reservasi SET Status = ? WHERE ID_Reservasi = ?';
            const [result] = await pool.execute(query, [status, reservationId]);
            
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0 ? 'Reservation status updated' : 'Reservation not found'
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Reservasi;
