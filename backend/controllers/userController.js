const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailSender");

/* =====================================================
   GENERATE JWT TOKEN
==================================================== */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/* =====================================================
   REGISTER USER
   POST /api/auth/register
==================================================== */
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ fullName, email, password: hashedPassword, phone });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* =====================================================
   LOGIN USER
   POST /api/auth/login
==================================================== */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =====================================================
   GET USER PROFILE
   GET /api/user/profile
   Protected
==================================================== */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ id: user._id, fullName: user.fullName, email: user.email, phone: user.phone });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* =====================================================
   UPDATE USER PROFILE
   PUT /api/user/profile
   Protected
==================================================== */
const updateUserProfile = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: { id: updatedUser._id, fullName: updatedUser.fullName, email: updatedUser.email, phone: updatedUser.phone }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/* =====================================================
   GET USER BOOKINGS
   GET /api/user/bookings
   Protected
==================================================== */
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate("trip"); // make sure Booking model has a 'trip' reference
    res.json({ bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

/* =====================================================
   GET USER PAYMENTS
   GET /api/user/payments
   Protected
==================================================== */
const getUserPayments = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).select("_id");
    const bookingIds = bookings.map((b) => b._id);
    const payments = await Payment.find({ booking: { $in: bookingIds } }).populate("booking");
    res.json({ payments });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

/* =====================================================
   FORGOT PASSWORD
   POST /api/auth/forgot-password
==================================================== */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please provide an email" });

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if user not found for security purposes
      return res.status(200).json({ message: "If an account with that email exists, we sent a password reset link." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and save to user
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    try {
      await sendPasswordResetEmail(user._id, user.email, user.fullName, resetUrl);
      res.status(200).json({ message: "If an account with that email exists, we sent a password reset link." });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: "Failed to send reset email. Please try again." });
    }

  } catch (error) {
    console.error("Forgot Password error:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

/* =====================================================
   RESET PASSWORD
   POST /api/auth/reset-password/:token
==================================================== */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Please provide a new password" });

    // Hash token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() } // Ensure token has not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset Password error:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  getUserPayments,
  forgotPassword,
  resetPassword,
};