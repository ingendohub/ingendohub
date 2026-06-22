const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    /* =========================
       RELATIONS
    ========================= */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // 1 ticket per booking
      index: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },

    /* =========================
       TRANSACTION
    ========================= */

    tx_ref: {
      type: String,
      required: true,
      unique: true, // enforce uniqueness
      index: true, // ✅ KEEP THIS
    },

    /* =========================
       TICKET IDENTIFICATION
    ========================= */

    ticketNumber: {
      type: String,
      unique: true,
      index: true,
    },

    qrCodeData: {
      type: String,
      index: true,
    },

    /* =========================
       PASSENGER SNAPSHOT
    ========================= */

    passengerName: {
      type: String,
      required: true,
    },

    passengerEmail: {
      type: String,
    },

    passengerPhone: {
      type: String,
    },

    /* =========================
       TRIP SNAPSHOT
    ========================= */

    trip: {
      from: { type: String, required: true },
      to: { type: String, required: true },
      date: { type: Date, required: true },
      time: { type: String },
    },

    /* =========================
       SEATS
    ========================= */

    seats: {
      type: [String],
      required: true,
      validate: [
        (arr) => Array.isArray(arr) && arr.length > 0,
        "At least one seat must be booked",
      ],
    },

    numberOfSeats: {
      type: Number,
      min: 1,
      default: function () {
        return this.seats?.length || 1;
      },
    },

    /* =========================
       PAYMENT SNAPSHOT
    ========================= */

    amountPaid: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "RWF",
    },

    paymentMethod: {
      type: String,
    },

    /* =========================
       METADATA
    ========================= */

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["VALID", "USED", "CANCELLED"],
      default: "VALID",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   AUTO GENERATE TICKET NUMBER
========================= */
ticketSchema.pre("save", function (next) {
  if (!this.ticketNumber) {
    this.ticketNumber = `TKT-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
  }
  next();
});

/* =========================
   INDEX OPTIMIZATION
========================= */

// ❌ REMOVED: duplicate tx_ref index

// Optional: seat safety (only if needed)
ticketSchema.index({ booking: 1, seats: 1 });

module.exports = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
