const Booking = require('../models/bookingmodel');
const Trip = require('../models/tripModel');
const Bus = require('../models/busModel');
const Admin = require('../models/adminModel');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'CONFIRMED' });
    const cancelledBookings = await Booking.countDocuments({ status: 'CANCELLED' });
    const totalTrips = await Trip.countDocuments();
    const totalBuses = await Bus.countDocuments();
    const totalAdmins = await Admin.countDocuments();

    res.status(200).json({
      totalAdmins,
      totalBuses,
      totalTrips,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to get dashboard stats' });
  }
};
