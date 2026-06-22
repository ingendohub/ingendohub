const express = require("express");
const router = express.Router();

// Import controller functions
const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/userController");

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Reset password route
router.post("/reset-password/:token", resetPassword);

module.exports = router;