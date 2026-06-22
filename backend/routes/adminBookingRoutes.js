const express = require("express");
const router = express.Router();

// Get all bookings
router.get("/", async (req, res) => {
  try {
    res.json({
      message: "All bookings fetched (admin)",
      data: [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete any booking
router.delete("/:id", async (req, res) => {
  try {
    res.json({
      message: `Booking ${req.params.id} deleted by admin`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking (admin override)
router.put("/:id", async (req, res) => {
  try {
    res.json({
      message: `Booking ${req.params.id} updated by admin`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;