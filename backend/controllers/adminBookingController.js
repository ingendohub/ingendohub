const Booking = require("../models/bookingModel");
const Trip = require("../models/tripModel");

/* =================================================
   GET ALL BOOKINGS (ADMIN)
================================================= */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("trip")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings"
    });
  }
};


/* =================================================
   CANCEL BOOKING (ADMIN)
================================================= */
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId).populate("trip");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Prevent cancelling twice
    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled"
      });
    }

    /* ===============================
       RELEASE SEATS BACK TO TRIP
    =============================== */

    const trip = await Trip.findById(booking.trip._id);

    if (trip && booking.seats && booking.seats.length > 0) {
      trip.availableSeats += booking.seats.length;
      await trip.save();
    }

    /* ===============================
       UPDATE BOOKING STATUS
    =============================== */

    booking.status = "CANCELLED";
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error while cancelling booking"
    });
  }
};