const express = require("express");
const router = express.Router();

const {
  registerCompany,
  loginCompany,
  getCurrentCompany
} = require("../controllers/companyAuthController");

const authCompany = require("../middleware/authCompany"); // JWT auth middleware

/* =====================================================
   COMPANY AUTH ROUTES
===================================================== */

// Public routes
router.post("/register", registerCompany);
router.post("/login", loginCompany);

// Protected route to get current company info
router.get("/me", authCompany, getCurrentCompany);

module.exports = router;