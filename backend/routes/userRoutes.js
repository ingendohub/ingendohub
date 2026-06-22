const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  getUserPayments,
} = require("../controllers/userController");

const { protectUser } = require("../middleware/authMiddleware");

/* =====================================================
   USER PROFILE ROUTES
===================================================== */

/*
GET USER PROFILE
Endpoint: /api/user/profile
Access: Private
*/
router.get("/profile", protectUser, getUserProfile);

/*
UPDATE USER PROFILE
Endpoint: /api/user/profile
Access: Private
*/
router.put("/profile", protectUser, updateUserProfile);

/* =====================================================
   USER DASHBOARD DATA ROUTES
===================================================== */

/*
GET USER BOOKINGS
Endpoint: /api/user/bookings
Access: Private
*/
router.get("/bookings", protectUser, getUserBookings);

/*
GET USER PAYMENTS
Endpoint: /api/user/payments
Access: Private
*/
router.get("/payments", protectUser, getUserPayments);

module.exports = router;