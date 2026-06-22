const express = require("express");
const router = express.Router();

// CONTROLLERS
const {
  createBus,
  getBuses,
  getBus,
  updateBus,
  deleteBus,
  getCompanyBuses
} = require("../controllers/busController");

// MIDDLEWARE
const {
  protectAdmin,
  protectCompany,
  adminOnly
} = require("../middleware/authMiddleware");

/* =====================================================
   PUBLIC ROUTES
===================================================== */

// List all buses
router.get("/", getBuses);


/* =====================================================
   COMPANY ROUTES
===================================================== */

// Company buses
router.get("/company", protectCompany, getCompanyBuses);

// Create bus
router.post("/", protectCompany, createBus);


/* =====================================================
   ADMIN ROUTES
===================================================== */

router.post("/admin/create", protectAdmin, adminOnly, createBus);
router.put("/admin/:id", protectAdmin, adminOnly, updateBus);
router.delete("/admin/:id", protectAdmin, adminOnly, deleteBus);


/* =====================================================
   GENERIC ROUTES (ALWAYS LAST)
===================================================== */

router.get("/:id", getBus);
router.put("/:id", protectCompany, updateBus);
router.delete("/:id", protectCompany, deleteBus);

module.exports = router;

