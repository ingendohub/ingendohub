const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "RWF",
      uppercase: true,
    },

    bookingRef: {
      type: String,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID", "FAILED"],
      default: "UNPAID",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["MOMO", "CARD", "CASH"],
      default: "MOMO",
    },

    transactionId: {
      type: String,
      default: null,
      index: true,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   🔐 AUTO-GENERATE BOOKING REF (ASYNC-SAFE)
==================================================== */
bookingSchema.pre("save", async function () {
  if (!this.bookingRef) {
    const uniquePart = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingRef =
      "XP-" + Date.now().toString(36).toUpperCase() + "-" + uniquePart;
  }
});

/* =====================================================
   🚀 INDEX OPTIMIZATION
   Speeds up dashboard queries
==================================================== */
bookingSchema.index({ company: 1, createdAt: -1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ trip: 1, createdAt: -1 });

/* =====================================================
   🛡️ DATA INTEGRITY CHECK
   Ensure multi-company safety
==================================================== */
bookingSchema.pre("validate", async function () {
  if (!this.company) {
    throw new Error("Booking must have a company");
  }

  if (!this.trip) {
    throw new Error("Booking must have a trip");
  }
});

/* =====================================================
   ❌ CANCEL BOOKING (ASYNC SAFE METHOD)
==================================================== */
bookingSchema.methods.cancel = async function () {
  if (this.status !== "CANCELLED") {
    this.status = "CANCELLED";
    this.paymentStatus = "FAILED";
    this.cancelledAt = new Date();
    await this.save();
  }
  return this;
};

/* =====================================================
   ✅ MARK BOOKING AS PAID (ASYNC SAFE METHOD)
==================================================== */
bookingSchema.methods.markPaid = async function (txId) {
  this.status = "CONFIRMED";
  this.paymentStatus = "PAID";
  this.transactionId = txId || null;
  await this.save();
  return this;
};

module.exports =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);









