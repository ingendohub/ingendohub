const Trip = require("../models/tripModel");

/* =========================================
   GET ALL TRIPS (ADMIN)
========================================= */
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find().sort({ date: 1 });

    res.json({
      success: true,
      count: trips.length,
      trips
    });

  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching trips"
    });
  }
};


/* =========================================
   UPDATE TRIP
========================================= */
exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, time } = req.body;

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }

    if (price !== undefined) trip.price = price;
    if (time !== undefined) trip.time = time;

    await trip.save();

    res.json({
      success: true,
      message: "Trip updated successfully",
      trip
    });

  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating trip"
    });
  }
};


/* =========================================
   DELETE TRIP
========================================= */
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByIdAndDelete(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }

    res.json({
      success: true,
      message: "Trip deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting trip"
    });
  }
};