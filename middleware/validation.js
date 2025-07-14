const { body, validationResult } = require("express-validator");

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    });
  }
  next();
};

// Registration validation rules
const validateRegistration = [
  body("Nama")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 70 })
    .withMessage("Name must be between 2 and 70 characters"),

  body("Email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("Password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("No_telp")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("id-ID")
    .withMessage("Please provide a valid Indonesian phone number"),

  body("Alamat")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 200 })
    .withMessage("Address must not exceed 200 characters"),

  handleValidationErrors,
];

// Login validation rules
const validateLogin = [
  body("Email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("Password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// Reservation validation rules
const validateReservation = [
  body("No_Kamar")
    .isInt({ min: 1 })
    .withMessage("Room number must be a positive integer"),

  body("Tanggal_Reservasi")
    .isISO8601()
    .withMessage("Please provide a valid date")
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date < now) {
        throw new Error("Reservation date must be in the future");
      }
      return true;
    }),

  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateReservation,
};
