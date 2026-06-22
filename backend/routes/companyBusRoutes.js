const express = require("express");
const router = express.Router();
const authCompany = require("../middleware/authCompany");

const {
  getCompanyBuses,
  createBus,
  deleteBus
} = require("../controllers/companyBusController");

// GET all buses
router.get("/", authCompany, getCompanyBuses);

// CREATE bus
router.post("/", authCompany, createBus);

// DELETE bus
router.delete("/:id", authCompany, deleteBus);

module.exports = router;