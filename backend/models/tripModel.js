const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
      index: true,
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: [true, "Bus ID is required"],
      index: true,
    },
    from: {
      type: String,
      required: [true, "Starting location is required"],
      trim: true,
      uppercase: true,
      index: true,
    },
    to: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
      uppercase: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Trip date is required"],
      index: true,
    },
    time: {
      type: String,
      required: [true, "Trip time is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, "Available seats cannot be negative"],
    },
    totalSeats: {
      type: Number,
      required: true,
      min: [1, "Total seats must be at least 1"],
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */
tripSchema.index({ company: 1, date: -1 });
tripSchema.index({ from: 1, to: 1, date: 1 });
tripSchema.index({ bus: 1, date: 1, time: 1 }, { unique: true });

/* =========================================================
   DATA VALIDATION (SAFE - NO next issues)
========================================================= */
tripSchema.pre("validate", function () {
  if (!this.company) {
    throw new Error("Trip must belong to a company");
  }

  if (!this.bus) {
    throw new Error("Trip must have a bus");
  }

  if (this.availableSeats > this.totalSeats) {
    throw new Error("Available seats cannot exceed total seats");
  }

  if (this.availableSeats < 0) {
    throw new Error("Available seats cannot be negative");
  }
});

/* =========================================================
   AUTO INITIALIZE SEATS (FIXED)
========================================================= */
tripSchema.pre("save", function () {
  // Only set on creation
  if (this.isNew) {
    if (
      this.availableSeats === undefined ||
      this.availableSeats === null ||
      this.availableSeats === 0
    ) {
      this.availableSeats = this.totalSeats;
    }
  }

  // Safety: never go below 0
  if (this.availableSeats < 0) {
    this.availableSeats = 0;
  }
});

/* =========================================================
   STATIC: ATOMIC SEAT BOOKING (BEST PRACTICE)
========================================================= */
tripSchema.statics.bookSeats = async function (tripId, seats) {
  if (seats <= 0) {
    throw new Error("Seats to book must be greater than 0");
  }

  const updatedTrip = await this.findOneAndUpdate(
    { _id: tripId, availableSeats: { $gte: seats } },
    { $inc: { availableSeats: -seats } },
    { new: true }
  );

  if (!updatedTrip) {
    throw new Error("Not enough seats available for this trip");
  }

  return updatedTrip;
};

/* =========================================================
   INSTANCE: RESTORE SEATS
========================================================= */
tripSchema.methods.restoreSeats = async function (seats) {
  if (seats <= 0) {
    throw new Error("Seats to restore must be greater than 0");
  }

  this.availableSeats += seats;

  if (this.availableSeats > this.totalSeats) {
    this.availableSeats = this.totalSeats;
  }

  await this.save();
  return this;
};

/* =========================================================
   VIRTUALS
========================================================= */
tripSchema.virtual("bookedSeats").get(function () {
  return this.totalSeats - this.availableSeats;
});

tripSchema.set("toJSON", { virtuals: true });
tripSchema.set("toObject", { virtuals: true });

/* =========================================================
   EXPORT
========================================================= */
module.exports =
  mongoose.models.Trip || mongoose.model("Trip", tripSchema);

