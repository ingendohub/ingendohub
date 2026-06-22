const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["RWF", "USD"],
      default: "RWF",
    },

    tx_ref: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    transaction_id: {
      type: Number,
      index: true,
    },

    flw_ref: {
      type: String,
      index: true,
    },

    payment_method: {
      type: String,
      default: "unknown",
    },

    channel: {
      type: String,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
      index: true,
    },

    checkoutLink: {
      type: String,
    },

    checkoutRedirectUrl: {
      type: String,
    },

    lastInitiationError: {
      type: Object,
    },

    ticketFile: {
      type: String,
    },

    raw_response: {
      type: Object,
    },

    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

/* ===============================
   ONLY ONE SUCCESS PAYMENT PER BOOKING
================================ */
paymentSchema.index(
  { booking: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "SUCCESS" },
  }
);

/* ===============================
   AUTO SET verifiedAt
================================ */
paymentSchema.pre("save", function () {
  if (this.status === "SUCCESS" && !this.verifiedAt) {
    this.verifiedAt = new Date();
  }
});

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
