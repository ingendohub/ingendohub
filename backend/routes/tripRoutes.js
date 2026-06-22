const express = require("express");
const router = express.Router();
const Trip = require("../models/tripModel");

// ================= GET ALL TRIPS =================
// Public endpoint (used on homepage search)
router.get("/", async (req, res) => {
  try {
    const { from, to, date } = req.query;

    let query = {};

    if (from) query.from = { $regex: new RegExp(`^${from}$`, "i") };
    if (to) query.to = { $regex: new RegExp(`^${to}$`, "i") };

    if (date) {
      // Match date ignoring time
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.date = { $gte: start, $lte: end };
    } else {
      // Enforce future dates if no date specified
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.date = { $gte: today };
    }

    const trips = await Trip.find(query)
      .populate("bus") // include bus details
      .populate("company", "name phone address")
      .sort({ date: 1 });

    res.json({
      success: true,
      count: trips.length,
      trips,
    });

  } catch (err) {
    console.error("Get trips error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= SEARCH TRIPS =================
router.get("/search", async (req, res) => {
  try {
    const { from, to, date } = req.query;

    let query = {};

    if (from) query.from = { $regex: new RegExp(`^${from}$`, "i") };
    if (to) query.to = { $regex: new RegExp(`^${to}$`, "i") };

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else {
      // Enforce future dates if no date specified
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.date = { $gte: today };
    }

    const trips = await Trip.find(query)
      .populate("bus")
      .populate("company", "name phone address")
      .sort({ date: 1 });

    res.json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (err) {
    console.error("Search trips error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= GET SINGLE TRIP =================
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("bus")
      .populate("company", "name phone address");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(trip);

  } catch (err) {
    console.error("Get trip error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
