const express = require("express");
const router = express.Router();

/* =====================================================
   CONTROLLERS
===================================================== */
const {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  getCompanyBookings,
  getMyBookings
} = require("../controllers/bookingController"); // Make sure these are exported from bookingController

/* =====================================================
   MIDDLEWARE
===================================================== */
const {
  protectUser,
  protectAdmin,
  adminOnly,
  protectCompany
} = require("../middleware/authMiddleware");

/* =====================================================
   ADMIN ROUTES
   Only accessible by admins
===================================================== */
// Get all bookings (ADMIN)
router.get("/admin", protectAdmin, adminOnly, getBookings);

// Get single booking by ID (ADMIN)
router.get("/admin/:id", protectAdmin, adminOnly, getBookingById);

// Cancel booking (ADMIN)
router.put("/admin/:id/cancel", protectAdmin, adminOnly, cancelBooking);

/* =====================================================
   COMPANY ROUTES
   Only accessible by logged-in company
===================================================== */
// Get bookings for company
router.get("/company", protectCompany, getCompanyBookings);

/* =====================================================
   USER ROUTES
===================================================== */
// Get bookings for logged-in user
router.get("/me", protectUser, getMyBookings);

/* =====================================================
   PUBLIC ROUTES
===================================================== */
// Create booking (public)
router.post("/", createBooking);

// Get booking by ID or reference (public)
router.get("/:id", getBookingById);

/* =====================================================
   EXPORT ROUTER
===================================================== */
module.exports = router;









