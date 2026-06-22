const Bus = require("../models/busModel");

/* =====================================================
   GET ALL BUSES FOR LOGGED-IN COMPANY
===================================================== */
const getCompanyBuses = async (req, res) => {
  try {
    const companyId = req.company.id;

    const buses = await Bus.find({ company: companyId }).sort({ createdAt: -1 });

    res.json(buses);
  } catch (error) {
    console.error("GetCompanyBuses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   CREATE NEW BUS FOR COMPANY
===================================================== */
const createBus = async (req, res) => {
  try {
    const companyId = req.company.id;
    const { model, plateNumber, seats } = req.body;

    if (!model || !plateNumber || !seats) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Bus.findOne({
      plateNumber: plateNumber.toUpperCase(),
      company: companyId
    });

    if (existing) {
      return res.status(400).json({
        message: "Bus with this plate number already exists"
      });
    }

    const bus = await Bus.create({
      model,
      plateNumber: plateNumber.toUpperCase(),
      seats,
      company: companyId
    });

    res.status(201).json(bus);

  } catch (error) {
    console.error("CreateBus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   DELETE BUS (ONLY OWNER COMPANY)
===================================================== */
const deleteBus = async (req, res) => {
  try {
    const companyId = req.company.id;
    const { id } = req.params;

    const bus = await Bus.findById(id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // 🔐 Ensure company owns the bus
    if (bus.company.toString() !== companyId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await bus.deleteOne();

    res.json({ message: "Bus deleted successfully" });

  } catch (error) {
    console.error("DeleteBus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCompanyBuses,
  createBus,
  deleteBus
};