const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { testConnection } = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create upload directories if they don't exist
const uploadDirs = [
  "uploads",
  "uploads/profiles", 
  "uploads/bukti_pembayaran"
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/reservasi", require("./routes/reservasi"));
app.use("/api/kamar", require("./routes/kamar"));
app.use("/api/tmp-users", require("./routes/tmp-users"));

// Serve uploaded files (bukti pembayaran)
app.use("/uploads", express.static("uploads"));

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Kost Patemon API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      reservasi: "/api/reservasi",
      kamar: "/api/kamar",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);

  // Test database connection
  await testConnection();
});

module.exports = app;
