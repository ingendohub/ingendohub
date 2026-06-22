const express = require("express");
const router = express.Router();

/* =========================================
   CONTROLLERS
========================================= */

const { registerAdmin, loginAdmin } =
  require("../controllers/adminController");

const { getDashboardStats } =
  require("../controllers/adminStatsController");

const { getAllBookings, cancelBooking } =
  require("../controllers/adminBookingController");

const { getAllTrips, updateTrip, deleteTrip } =
  require("../controllers/adminTripController");

/* =========================================
   MIDDLEWARE
========================================= */

const {
  protect,
  adminOnly
} = require("../middleware/adminAuthMiddleware");

/* =========================================
   PUBLIC ROUTES
========================================= */

// ⚠️ Use ONLY to create first admin account
router.post("/register", registerAdmin);

// Admin login
router.post("/login", loginAdmin);

/* =========================================
   PROTECTED ROUTES (ADMIN ONLY)
========================================= */

// Apply authentication to all routes below
router.use(protect, adminOnly);

/* ================= DASHBOARD ================= */

router.get("/stats", getDashboardStats);

/* ================= BOOKINGS ================= */

router.get("/bookings", getAllBookings);

router.patch("/bookings/:id/cancel", cancelBooking);

/* ================= TRIPS ================= */

router.get("/trips", getAllTrips);

router.put("/trips/:id", updateTrip);

router.delete("/trips/:id", deleteTrip);

module.exports = router;








