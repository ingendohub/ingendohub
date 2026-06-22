const mongoose = require("mongoose");
const Bus = require("../models/busModel");

/* =========================
   CREATE BUS (COMPANY)
========================= */
exports.createBus = async (req, res) => {
  try {
    const { model, seats, plateNumber } = req.body;

    if (!model || !seats || !plateNumber) {
      return res.status(400).json({
        success: false,
        message: "Model, seats, and plateNumber are required"
      });
    }

    const bus = await Bus.create({
      model: model.trim(),
      seats: Number(seats),
      plateNumber: plateNumber.trim(),
      company: req.company._id, // link bus to logged-in company
    });

    res.status(201).json({
      success: true,
      message: "Bus created successfully",
      data: bus,
    });
  } catch (error) {
    console.error("Create bus error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating bus",
      error: error.message,
    });
  }
};

/* =========================
   GET ALL BUSES (PUBLIC)
========================= */
exports.getBuses = async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate("company", "name email") // optional, for admin dashboard
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    console.error("Get buses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching buses",
      error: error.message,
    });
  }
};

/* =========================
   GET SINGLE BUS
========================= */
exports.getBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate("company", "name email");

    if (!bus) {
      return res.status(404).json({ success: false, message: "Bus not found" });
    }

    res.status(200).json({ success: true, data: bus });
  } catch (error) {
    console.error("Get bus error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bus",
      error: error.message
    });
  }
};

/* =========================
   GET BUSES FOR LOGGED-IN COMPANY
========================= */
exports.getCompanyBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ company: req.company._id }).sort({ createdAt: -1 });

    // Include all relevant fields for frontend
    const formattedBuses = buses.map(bus => ({
      _id: bus._id,
      model: bus.model,
      plateNumber: bus.plateNumber || bus.model,
      seats: bus.seats
    }));

    res.status(200).json({
      success: true,
      buses: formattedBuses
    });
  } catch (error) {
    console.error("Get company buses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching company buses",
      error: error.message
    });
  }
};

/* =========================
   UPDATE BUS (COMPANY)
========================= */
exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    if (req.company && bus.company.toString() !== req.company._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this bus" });
    }

    const { model, seats, plateNumber } = req.body;
    if (model) bus.model = model.trim();
    if (seats) bus.seats = Number(seats);
    if (plateNumber) bus.plateNumber = plateNumber.trim();

    await bus.save();

    res.status(200).json({ success: true, message: "Bus updated successfully", data: bus });
  } catch (error) {
    console.error("Update bus error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* =========================
   DELETE BUS (COMPANY)
========================= */
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    if (req.company && bus.company.toString() !== req.company._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this bus" });
    }

    await bus.deleteOne();

    res.status(200).json({ success: true, message: "Bus deleted successfully" });
  } catch (error) {
    console.error("Delete bus error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};