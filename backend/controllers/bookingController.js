const mongoose = require("mongoose");
const Booking = require("../models/bookingModel");
const Trip = require("../models/tripModel");
const { sendBookingPendingEmail } = require("../utils/emailSender");

/* =========================
   CREATE BOOKING (PUBLIC + USER)
========================= */
exports.createBooking = async (req, res) => {
  try {
    let { tripId, fullName, phone, email, seats } = req.body;
    const userId = req.user ? req.user._id : null;

    // =========================
    // VALIDATION
    // =========================
    if (!tripId || !fullName || !phone || !email || !seats) {
      return res.status(400).json({
        success: false,
        message: "Missing booking data",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    seats = Number(seats);
    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({
        success: false,
        message: "Seats must be a positive number",
      });
    }

    fullName = fullName.trim();
    phone = phone.trim();
    email = email.trim().toLowerCase();

    // =========================
    // LOCK SEATS ATOMICALLY
    // =========================
    const trip = await Trip.findOneAndUpdate(
      { _id: tripId, availableSeats: { $gte: seats } },
      { $inc: { availableSeats: -seats } },
      { new: true }
    );

    if (!trip) {
      return res.status(400).json({
        success: false,
        message: "Not enough seats available",
      });
    }

    // =========================
    // CRITICAL CHECK: COMPANY EXISTS
    // =========================
    if (!trip.company) {
      console.error("❌ Trip missing company:", trip._id);

      // Rollback seats (important!)
      await Trip.findByIdAndUpdate(trip._id, {
        $inc: { availableSeats: seats },
      });

      return res.status(500).json({
        success: false,
        message: "Trip is not linked to any company",
      });
    }

    const totalPrice = trip.price * seats;

    // =========================
    // CREATE BOOKING
    // =========================
    const booking = await Booking.create({
      user: userId,
      trip: trip._id,
      company: trip.company, // ✅ FIXED (no ._id needed)
      fullName,
      phone,
      email,
      seats,
      totalPrice,
      currency: "RWF",
      status: "PENDING",
      paymentStatus: "UNPAID",
    });

    console.log("✅ Booking saved:", booking._id);

    // Send email asynchronously — attach the trip object so the template gets route/time info
    const bookingWithTrip = { ...booking.toObject(), trip };
    sendBookingPendingEmail(bookingWithTrip, process.env.FRONTEND_URL).catch(err => console.error("Email err:", err));

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      bookingRef: booking.bookingRef,
      booking,
    });
  } catch (error) {
    console.error("❌ Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating booking",
    });
  }
};

/* =========================
   GET ALL BOOKINGS (ADMIN)
========================= */
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: "trip", populate: { path: "bus" } })
      .populate("company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load bookings",
    });
  }
};

/* =========================
   GET COMPANY BOOKINGS (COMPANY DASHBOARD)
========================= */
exports.getCompanyBookings = async (req, res) => {
  try {
    if (!req.company || !req.company._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: company not found",
      });
    }

    const companyId = req.company._id;

    const bookings = await Booking.find({ company: companyId })
      .populate({ path: "trip", populate: { path: "bus" } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Get company bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load company bookings",
    });
  }
};

/* =========================
   GET USER BOOKINGS (USER DASHBOARD)
========================= */
exports.getMyBookings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId })
      .populate({ path: "trip", populate: { path: "bus" } })
      .populate("company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Get my bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load user bookings",
    });
  }
};

/* =========================
   GET BOOKING BY ID OR REF
========================= */
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    let booking;

    if (mongoose.Types.ObjectId.isValid(id)) {
      booking = await Booking.findById(id)
        .populate({ path: "trip", populate: { path: "bus" } })
        .populate("company");
    } else {
      booking = await Booking.findOne({ bookingRef: id })
        .populate({ path: "trip", populate: { path: "bus" } })
        .populate("company");
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("❌ Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   CANCEL BOOKING (ADMIN)
========================= */
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled",
      });
    }

    // Restore seats
    await Trip.findByIdAndUpdate(booking.trip, {
      $inc: { availableSeats: booking.seats },
    });

    booking.status = "CANCELLED";
    booking.paymentStatus = "FAILED";
    booking.cancelledAt = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("❌ Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};














