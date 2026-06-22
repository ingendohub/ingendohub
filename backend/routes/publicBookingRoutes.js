const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const Trip = require("../models/tripModel"); // optional, to validate trip exists
const Company = require("../models/companyModel"); // optional, to attach company
const { optionalUser } = require("../middleware/authMiddleware");
const { sendBookingPendingEmail } = require("../utils/emailSender");

/* ================= CREATE BOOKING ================= */
router.post("/", optionalUser, async (req, res) => {
  let reservedTrip = null;
  let seatCount = 0;

  try {
    const { tripId, fullName, phone, email, seats } = req.body;

    if (!tripId || !fullName || !phone || !email || !seats) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    seatCount = Number(seats);
    if (!Number.isInteger(seatCount) || seatCount < 1) {
      return res.status(400).json({ message: "Seats must be a positive number" });
    }

    reservedTrip = await Trip.findOneAndUpdate(
      { _id: tripId, availableSeats: { $gte: seatCount } },
      { $inc: { availableSeats: -seatCount } },
      { new: true }
    );

    if (!reservedTrip) {
      return res.status(400).json({ message: "Trip not found or not enough seats available" });
    }

    if (!reservedTrip.company) {
      await Trip.findByIdAndUpdate(reservedTrip._id, {
        $inc: { availableSeats: seatCount },
      });
      reservedTrip = null;

      return res.status(500).json({ message: "Trip is not linked to any company" });
    }

    const totalPrice = reservedTrip.price * seatCount;

    const booking = await Booking.create({
      user: req.user ? req.user._id : null,
      trip: reservedTrip._id,
      company: reservedTrip.company,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      seats: seatCount,
      totalPrice,
    });

    // 🔔 Send booking confirmation email (non-blocking)
    sendBookingPendingEmail(booking, process.env.FRONTEND_URL)
      .catch(err => console.error("❌ Booking email error:", err));

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);

    if (reservedTrip) {
      await Trip.findByIdAndUpdate(reservedTrip._id, {
        $inc: { availableSeats: seatCount },
      });
    }

    res.status(500).json({ message: error.message });
  }
});

/* ================= GET BOOKING BY REF ================= */
router.get("/:bookingRef", async (req, res) => {
  try {
    const { bookingRef } = req.params;

    const booking = await Booking.findOne({ bookingRef })
      .populate("trip")
      .populate("company")
      .populate("user");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({
      message: "Booking fetched successfully",
      booking,
    });
  } catch (error) {
    console.error("Fetch booking error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= GET ALL BOOKINGS (ADMIN/DEBUG) ================= */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("trip")
      .populate("company")
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({
      message: "All bookings",
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Fetch all bookings error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= DELETE BOOKING (OPTIONAL) ================= */
router.delete("/:bookingRef", async (req, res) => {
  try {
    const { bookingRef } = req.params;
    const booking = await Booking.findOneAndDelete({ bookingRef });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "Booking deleted successfully", booking });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
