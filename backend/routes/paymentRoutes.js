const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { flutterwaveWebhook } = require("../controllers/paymentWebhookController");
const {
  getTicketByTxRef,
  downloadTicketPdf,
} = require("../controllers/ticketController");

// =============================
// HELPER: Async wrapper to catch errors
// =============================
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// =============================
// PAYMENT ROUTES
// =============================

// Initiate payment
// POST /api/payments/initiate
router.post(
  "/initiate",
  asyncHandler(async (req, res) => {
    const { bookingId, bookingRef } = req.body;

    if (!bookingId && !bookingRef) {
      return res.status(400).json({ message: "Missing bookingId or bookingRef" });
    }

    await paymentController.initiatePayment(req, res);
  })
);

// Verify payment (redirect callback from payment gateway)
// GET /api/payments/verify
router.get(
  "/verify",
  asyncHandler(async (req, res) => {
    await paymentController.verifyPayment(req, res);
  })
);

// Server-side Flutterwave redirect callback
// GET /api/payments/callback
router.get(
  "/callback",
  asyncHandler(async (req, res) => {
    await paymentController.paymentCallback(req, res);
  })
);

// Flutterwave webhook endpoint
// POST /api/payments/webhook
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    await flutterwaveWebhook(req, res);
  })
);

// Download or view ticket by transaction reference
// GET /api/payments/ticket/:tx_ref
router.get(
  "/ticket/:tx_ref/pdf",
  asyncHandler(async (req, res) => {
    const { tx_ref } = req.params;
    if (!tx_ref) return res.status(400).json({ message: "Missing tx_ref" });

    await downloadTicketPdf(req, res);
  })
);

router.get(
  "/ticket/:tx_ref",
  asyncHandler(async (req, res) => {
    const { tx_ref } = req.params;
    if (!tx_ref) return res.status(400).json({ message: "Missing tx_ref" });

    await getTicketByTxRef(req, res);
  })
);

module.exports = router;







