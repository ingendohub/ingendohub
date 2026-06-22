const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

// Import controller functions
const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/userController");

// ===== Standard Auth =====

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Reset password route
router.post("/reset-password/:token", resetPassword);

// ===== Google OAuth =====

// 1. Redirect user to Google login page
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// 2. Google callback — exchange code for profile, issue JWT, redirect to frontend
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}?auth=error`, session: false }),
  (req, res) => {
    const { user, token } = req.user;

    // Build a slim user object safe to put in a URL param
    const userData = encodeURIComponent(
      JSON.stringify({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        picture: user.picture || "",
      })
    );

    // Redirect to frontend — the page will read params & store in localStorage
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${userData}`);
  }
);

module.exports = router;