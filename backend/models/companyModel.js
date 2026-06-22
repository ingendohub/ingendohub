const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      trim: true
    },

    address: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent OverwriteModelError when server reloads
const Company = mongoose.models.Company || mongoose.model("Company", companySchema);

module.exports = Company;