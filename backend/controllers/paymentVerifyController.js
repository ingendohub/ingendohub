const axios = require('axios');
const Payment = require('../models/paymentModel');
const Booking = require('../models/bookingModel');
const Ticket = require('../models/ticketModel');
const generateTicket = require('../utils/generateTicket');
const { sendTicketEmail } = require('../utils/emailSender');

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

/**
 * VERIFY PAYMENT
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { transaction_id, tx_ref } = req.query;

    // 1️⃣ Validate query
    if (!transaction_id && !tx_ref) {
      return res.status(400).json({ status: 'FAILED', message: 'Transaction ID missing' });
    }

    // 2️⃣ Verify with Flutterwave
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
    );

    if (response.data.status !== 'success') {
      return res.status(400).json({ status: 'FAILED', message: 'Flutterwave verification failed' });
    }

    const flwData = response.data.data;

    if (flwData.status !== 'successful') {
      return res.status(400).json({ status: 'FAILED', message: 'Payment not successful' });
    }

    // 3️⃣ Find payment by tx_ref
    const payment = await Payment.findOne({ tx_ref: flwData.tx_ref }).populate('booking');
    if (!payment || !payment.booking) {
      console.error('Payment not found for tx_ref:', flwData.tx_ref);
      return res.status(404).json({ status: 'FAILED', message: 'Payment record missing' });
    }

    // 4️⃣ Idempotency: if already SUCCESS, ensure ticket exists
    if (payment.status === 'SUCCESS') {
      let ticket = await Ticket.findOne({ bookingId: payment.booking._id });
      if (!ticket) ticket = await generateTicket(payment.booking, payment);

      return res.json({
        status: 'SUCCESS',
        message: 'Payment already verified',
        ticketUrl: `/api/ticket/${payment.tx_ref}`,
      });
    }

    // 5️⃣ Amount & currency validation (allow small float rounding)
    if (
      Math.abs(Number(flwData.amount) - Number(payment.amount)) > 1 ||
      flwData.currency !== payment.currency
    ) {
      payment.status = 'FAILED';
      payment.raw_response = flwData;
      await payment.save();

      return res.status(400).json({ status: 'FAILED', message: 'Amount or currency mismatch' });
    }

    // 6️⃣ Update payment record
    payment.status = 'SUCCESS';
    payment.transaction_id = transaction_id;
    payment.flw_ref = flwData.flw_ref;
    payment.payment_method = flwData.payment_type;
    payment.raw_response = flwData;
    await payment.save();

    // 7️⃣ Update booking
    const booking = payment.booking;
    booking.status = 'CONFIRMED';
    booking.paymentStatus = 'PAID';
    await booking.save();

    // 8️⃣ Generate ticket if missing
    let ticket = await Ticket.findOne({ bookingId: booking._id });
    if (!ticket) {
      const result = await generateTicket(booking, payment);
      ticket = result.ticket;
      sendTicketEmail(booking, result.pdfBuffer).catch(err => console.error("Ticket email error:", err));
    }

    // 9️⃣ Return success JSON (frontend can redirect)
    return res.json({
      status: 'SUCCESS',
      message: 'Payment verified successfully',
      ticketUrl: `/api/ticket/${payment.tx_ref}`,
    });
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message || error);
    return res.status(500).json({ status: 'FAILED', message: 'Verification failed' });
  }
};

