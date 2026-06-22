const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/companyDashboardController");
const authCompany = require("../middleware/authCompany"); // JWT middleware

/* =====================================================
   COMPANY DASHBOARD ROUTES
   🔒 Protected by authCompany middleware
===================================================== */

// GET /api/company/dashboard/stats
router.get("/stats", authCompany, getDashboardStats);

module.exports = router;