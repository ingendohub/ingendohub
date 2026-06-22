const crypto = require('crypto');
const Payment = require('../models/paymentModel');
const Booking = require('../models/bookingModel');
const Ticket = require('../models/ticketModel');
const generateTicket = require('../utils/generateTicket');
const { sendTicketEmail } = require('../utils/emailSender');

const FLW_SECRET_HASH =
  process.env.FLUTTERWAVE_SECRET_HASH || process.env.FLW_WEBHOOK_SECRET;

/**
 * FLUTTERWAVE WEBHOOK
 */
exports.flutterwaveWebhook = async (req, res) => {
  try {
    /* =========================
       1️⃣ Verify signature
    ========================= */
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== FLW_SECRET_HASH) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const payload = req.body;

    if (payload.event !== 'charge.completed') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const data = payload.data;

    /* =========================
       2️⃣ Find payment
    ========================= */
    const payment = await Payment.findOne({ tx_ref: data.tx_ref });

    if (!payment) {
      console.error('Webhook payment not found:', data.tx_ref);
      return res.status(200).json({ message: 'Payment not found' });
    }

    /* =========================
       3️⃣ Idempotency
    ========================= */
    if (payment.status === 'SUCCESS') {
      return res.status(200).json({ message: 'Already processed' });
    }

    /* =========================
       4️⃣ Validate amount & currency
    ========================= */
    if (
      Number(data.amount) !== Number(payment.amount) ||
      data.currency !== payment.currency ||
      data.status !== 'successful'
    ) {
      payment.status = 'FAILED';
      payment.raw_response = data;
      await payment.save();

      return res.status(200).json({ message: 'Payment failed' });
    }

    /* =========================
       5️⃣ Update payment
    ========================= */
    payment.status = 'SUCCESS';
    payment.transaction_id = data.id;
    payment.flw_ref = data.flw_ref;
    payment.payment_method = data.payment_type;
    payment.raw_response = data;
    payment.verifiedAt = new Date();
    await payment.save();

    /* =========================
       6️⃣ Update booking
    ========================= */
    const booking = await Booking.findByIdAndUpdate(payment.booking, {
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      transactionId: data.id,
    }, { new: true }).populate('trip');

    if (booking) {
      const existingTicket = await Ticket.findOne({ booking: booking._id });
      if (!existingTicket) {
        const { pdfBuffer } = await generateTicket(booking, payment);
        sendTicketEmail(booking, pdfBuffer).catch(err => console.error("Ticket email error:", err));
      }
    }

    return res.status(200).json({ message: 'Webhook processed' });

  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(500).json({ message: 'Webhook processing error' });
  }
};
