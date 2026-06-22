const express = require("express");
const router = express.Router();

// ✅ Middleware
const { protectCompany } = require("../middleware/authMiddleware");

// ✅ Bus Controllers
const {
  getCompanyBuses,
  createBus,
  deleteBus
} = require("../controllers/companyBusController");

// ✅ Trip Controllers
const {
  createTrip,
  getCompanyTrips,
  deleteTrip
} = require("../controllers/tripController");

// =========================
// 🚌 BUS ROUTES
// =========================

// Get all company buses
router.get("/buses", protectCompany, getCompanyBuses);

// Create bus ✅ (FIXED)
router.post("/buses", protectCompany, createBus);

// Delete bus ✅ (FIXED)
router.delete("/buses/:id", protectCompany, deleteBus);

// =========================
// 🧭 TRIP ROUTES
// =========================

// Create trip
router.post("/trips", protectCompany, createTrip);

// Get company trips ✅ (FIXED NAME)
router.get("/trips", protectCompany, getCompanyTrips);

// Delete trip ✅ (ADDED)
router.delete("/trips/:id", protectCompany, deleteTrip);

// =========================
// 🎫 BOOKINGS + DASHBOARD
// =========================

const {
  getBookings,
  getDashboard
} = require("../controllers/companyController");

// Bookings
router.get("/bookings", protectCompany, getBookings);

// Dashboard
router.get("/dashboard", protectCompany, getDashboard);

module.exports = router;

