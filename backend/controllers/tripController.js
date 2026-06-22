const Trip = require("../models/tripModel");
const Bus = require("../models/busModel");

/* ==========================
   GET ALL TRIPS (PUBLIC)
========================== */
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("bus")
      .sort({ createdAt: -1 });

    res.status(200).json({ trips });
  } catch (error) {
    console.error("GetTrips error:", error);
    res.status(500).json({ message: "Server error while fetching trips" });
  }
};

/* ==========================
   GET COMPANY TRIPS
========================== */
exports.getCompanyTrips = async (req, res) => {
  try {
    const companyId = req.company.id;

    const trips = await Trip.find({ company: companyId })
      .populate("bus")
      .sort({ createdAt: -1 });

    res.status(200).json({ trips });
  } catch (error) {
    console.error("GetCompanyTrips error:", error);
    res.status(500).json({ message: "Server error while fetching trips" });
  }
};

/* ==========================
   SEARCH TRIPS (PUBLIC)
========================== */
exports.searchTrips = async (req, res) => {
  try {
    let { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        message: "Missing query params: from, to, date are required"
      });
    }

    const trips = await Trip.find({
      from: { $regex: new RegExp(`^${from.trim()}$`, "i") },
      to: { $regex: new RegExp(`^${to.trim()}$`, "i") },
      date: date.trim(),
      availableSeats: { $gt: 0 }
    })
      .populate("bus")
      .sort({ time: 1 });

    res.status(200).json({
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error("SearchTrips error:", error);
    res.status(500).json({ message: "Server error while searching trips" });
  }
};

/* ==========================
   GET SINGLE TRIP
========================== */
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("bus");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json({ trip });
  } catch (error) {
    console.error("GetTripById error:", error);
    res.status(500).json({ message: "Server error while fetching trip" });
  }
};

/* ==========================
   CREATE TRIP (COMPANY)
========================== */
exports.createTrip = async (req, res) => {
  try {
    const companyId = req.company.id;

    const { bus, from, to, date, time, price } = req.body;

    if (!bus || !from || !to || !date || !time || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Ensure bus belongs to this company
    const busExists = await Bus.findOne({ _id: bus, company: companyId });

    if (!busExists) {
      return res.status(400).json({
        message: "Invalid bus or bus does not belong to your company"
      });
    }

    const trip = await Trip.create({
      company: companyId,
      bus,
      from: from.trim(),
      to: to.trim(),
      date: date.trim(),
      time,
      price,
      availableSeats: busExists.seats
    });

    res.status(201).json({
      message: "Trip created successfully",
      trip
    });
  } catch (error) {
    console.error("CreateTrip error:", error);
    res.status(500).json({ message: "Server error while creating trip" });
  }
};

/* ==========================
   UPDATE TRIP (COMPANY)
========================== */
exports.updateTrip = async (req, res) => {
  try {
    const companyId = req.company.id;

    const { price, time } = req.body;

    if (price === undefined && !time) {
      return res.status(400).json({
        message: "Nothing to update (price or time required)"
      });
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      company: companyId
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (price !== undefined) trip.price = price;
    if (time) trip.time = time;

    await trip.save();

    res.status(200).json({
      message: "Trip updated successfully",
      trip
    });
  } catch (error) {
    console.error("UpdateTrip error:", error);
    res.status(500).json({ message: "Server error while updating trip" });
  }
};

/* ==========================
   DELETE TRIP (COMPANY)
========================== */
exports.deleteTrip = async (req, res) => {
  try {
    const companyId = req.company.id;

    const trip = await Trip.findOne({
      _id: req.params.id,
      company: companyId
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    await trip.deleteOne();

    res.status(200).json({
      message: "Trip deleted successfully"
    });
  } catch (error) {
    console.error("DeleteTrip error:", error);
    res.status(500).json({ message: "Server error while deleting trip" });
  }
};











