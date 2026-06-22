const Bus = require("../models/busModel");
const Trip = require("../models/tripModel");
const Booking = require("../models/bookingModel");
const Company = require("../models/companyModel"); // <-- Add this

/* =========================
   GET COMPANY BUSES
========================= */
exports.getCompanyBuses = async (req, res) => {
  try {
    if (!req.company) {
      return res.status(401).json({ message: "Company info missing" });
    }

    const buses = await Bus.find({ company: req.company._id });

    res.status(200).json({
      success: true,
      count: buses.length,
      buses
    });
  } catch (error) {
    console.error("Get buses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   CREATE TRIP
========================= */
exports.createTrip = async (req, res) => {
  try {
    const { from, to, date, time, price, bus } = req.body;

    if (!from || !to || !date || !time || !price || !bus) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!req.company) {
      return res.status(401).json({ message: "Company info missing" });
    }

    const existingBus = await Bus.findOne({
      _id: bus,
      company: req.company._id
    });

    if (!existingBus) {
      return res.status(403).json({
        message: "Unauthorized: Bus does not belong to your company"
      });
    }

    const trip = await Trip.create({
      from,
      to,
      date,
      time,
      price,
      bus,
      company: req.company._id,
      availableSeats: existingBus.seats,
      tripName: req.company.name || existingBus.name || existingBus.plateNumber || "Unnamed Trip" // <-- Set tripName as company name
    });

    res.status(201).json({
      success: true,
      trip
    });
  } catch (error) {
    console.error("Create trip error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET COMPANY TRIPS
========================= */
exports.getTrips = async (req, res) => {
  try {
    if (!req.company) {
      return res.status(401).json({ message: "Company info missing" });
    }

    const trips = await Trip.find({ company: req.company._id })
      .populate("bus");

    // Include company name in trip data
    const formattedTrips = trips.map((t) => ({
      _id: t._id,
      from: t.from,
      to: t.to,
      date: t.date,
      time: t.time,
      price: t.price,
      bus: t.bus,
      availableSeats: t.availableSeats,
      tripName: t.tripName || req.company.name || "Unnamed Trip" // fallback to company name
    }));

    res.status(200).json({ trips: formattedTrips });
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET COMPANY BOOKINGS
========================= */
exports.getBookings = async (req, res) => {
  try {
    if (!req.company) {
      return res.status(401).json({ message: "Company info missing" });
    }

    const trips = await Trip.find({ company: req.company._id }).select("_id tripName from to date time price bus");
    const tripIds = trips.map(t => t._id);

    const bookings = await Booking.find({ trip: { $in: tripIds } })
      .populate({
        path: "trip",
        select: "tripName from to date time price bus availableSeats",
        populate: { path: "bus", select: "name plateNumber seats" }
      });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET DASHBOARD STATS
========================= */
exports.getDashboard = async (req, res) => {
  try {
    if (!req.company) {
      return res.status(401).json({ message: "Company info missing" });
    }

    const buses = await Bus.find({ company: req.company._id });
    const trips = await Trip.find({ company: req.company._id });
    const tripIds = trips.map(t => t._id);

    const bookings = await Booking.find({ trip: { $in: tripIds } });

    const revenue = bookings.reduce((total, b) => {
      return total + (b.totalPrice || (b.trip?.price && b.seats ? b.trip.price * b.seats : 0));
    }, 0);

    res.status(200).json({
      buses: buses.length,
      trips: trips.length,
      bookings: bookings.length,
      revenue
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};