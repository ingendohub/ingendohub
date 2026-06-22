const Bus = require("../models/busModel");
const Trip = require("../models/tripModel");
const Booking = require("../models/bookingModel");

const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.company.id; // from authCompany middleware

    // Count buses for this company
    const totalBuses = await Bus.countDocuments({ company: companyId });

    // Count trips for this company
    const totalTrips = await Trip.countDocuments({ company: companyId });

    // Count bookings for this company
    const totalBookings = await Booking.countDocuments({ company: companyId });

    // Calculate total revenue for this company
    const revenueData = await Booking.aggregate([
      { $match: { company: companyId, status: "CONFIRMED" } }, // only confirmed bookings
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" } // your Booking schema uses totalPrice
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      totalBuses,
      totalTrips,
      totalBookings,
      totalRevenue
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };