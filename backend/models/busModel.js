const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, 'Bus model is required'],
      trim: true,
    },
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [1, 'Seats must be at least 1'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Bus must belong to a company'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Bus || mongoose.model('Bus', busSchema);
