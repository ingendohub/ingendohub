require("dotenv").config();
const mongoose = require("mongoose");
const Bus = require("./models/busModel");

const MONGO_URI = process.env.MONGO_URI;

const BUS_ID = "69398c16e301ac27d71016a6";
const COMPANY_ID = "69afd79eae23190b89b3861f";

async function updateBus() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    const bus = await Bus.findById(BUS_ID);

    if (!bus) {
      console.log("❌ Bus not found");
      process.exit();
    }

    bus.company = COMPANY_ID;
    await bus.save();

    console.log(`✅ Bus ${BUS_ID} updated with company ${COMPANY_ID}`);
    process.exit();

  } catch (err) {
    console.error("Error updating bus:", err);
    process.exit(1);
  }
}

updateBus();