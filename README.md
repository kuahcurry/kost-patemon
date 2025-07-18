# Kost Patemon API

A Node.js REST API for managing Kost Patemon (boarding house) reservations and user management.

## Features

- User registration and authentication
- JWT-based authentication
- Room management
- Reservation system
- Role-based access control (Admin/Penyewa)
- Password hashing with bcrypt
- Input validation

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=kost_patemon
   DB_PORT=3306
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=3000
   NODE_ENV=development
   ```

4. Make sure your MySQL database is running and import the `database.sql` file

5. Start the server:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Rooms (Kamar)

- `GET /api/kamar` - Get all rooms
- `GET /api/kamar/available` - Get available rooms
- `GET /api/kamar/:id` - Get room by ID
- `PUT /api/kamar/:id/availability` - Update room availability (admin only)

### Reservations

- `POST /api/reservasi` - Create new reservation (protected)
- `GET /api/reservasi/my-reservations` - Get user's reservations (protected)
- `GET /api/reservasi/all` - Get all reservations (admin only)
- `PUT /api/reservasi/:id/status` - Update reservation status (admin only)

## Usage Examples

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "Nama": "John Doe",
    "Email": "john@example.com",
    "Password": "password123",
    "No_telp": "081234567890",
    "Alamat": "Jl. Example No. 123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "Email": "john@example.com",
    "Password": "password123"
  }'
```

### Get available rooms

```bash
curl -X GET http://localhost:3000/api/kamar/available
```

### Create a reservation (requires authentication)

```bash
curl -X POST http://localhost:3000/api/reservasi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "No_Kamar": 1,
    "Tanggal_Reservasi": "2025-08-01T10:00:00Z"
  }'
```

## Database Schema

The API uses the following main tables:

- `user` - User information and authentication
- `kamar` - Room information
- `reservasi` - Reservation data
- `ulasan` - Room reviews
- `pembayaran` - Payment information

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Input validation
- SQL injection protection
- CORS enabled

## Development

For development, use:

```bash
npm run dev
```

This will start the server with nodemon for automatic restarting on file changes.

## License

ISC
