const express = require("express");
const router = express.Router();

// Get user's bookings
router.get("/", async (req, res) => {
  try {
    // Later: filter by userId from auth
    res.json({
      message: "User bookings fetched",
      data: [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel a booking
router.delete("/:id", async (req, res) => {
  try {
    res.json({
      message: `Booking ${req.params.id} cancelled by user`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;