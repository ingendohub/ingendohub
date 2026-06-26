const axios = require("axios");
const mongoose = require("mongoose");

const Ticket = require("../models/ticketModel");
const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");
const Trip = require("../models/tripModel");
const { buildTicketVerificationUrl } = require("../utils/ticketVerification");
const generateTicket = require("../utils/generateTicket");
const { sendTicketEmail } = require("../utils/emailSender");
const momoService = require("../utils/momoService");

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

const generateTicketNumber = () =>
  `TKT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryAfter = (error) => {
  const retryAfter =
    error.response?.data?.retry_after || error.response?.headers?.["retry-after"];

  const seconds = Number(retryAfter);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 30;
};

const isRetryableFlutterwaveError = (error) => {
  // Only apply Flutterwave retry logic to Axios errors from Flutterwave
  if (!error.isAxiosError) return false;

  const status = error.response?.status;
  const data = error.response?.data;

  return (
    !status ||
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status >= 500 ||
    data?.retryable === true ||
    data?.cloudflare_error === true
  );
};

const createFlutterwaveCheckout = async (payload) => {
  const delays = [0, 1200, 2500];
  let lastError;

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (delays[attempt]) {
      await sleep(delays[attempt]);
    }

    try {
      return await axios.post("https://api.flutterwave.com/v3/payments", payload, {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
        timeout: 15000,
      });
    } catch (error) {
      lastError = error;

      if (!isRetryableFlutterwaveError(error) || attempt === delays.length - 1) {
        throw error;
      }

      console.warn(
        `Flutterwave checkout retry ${attempt + 1}/${delays.length - 1}:`,
        error.response?.data?.title || error.message
      );
    }
  }

  throw lastError;
};

const ensureTicket = async (booking, payment, session) => {
  const seatsArray = Array.isArray(booking.seats)
    ? booking.seats.map(String)
    : [String(booking.seats || 1)];
  const ticketNumber = generateTicketNumber();

  const ticket = await Ticket.findOneAndUpdate(
    { booking: booking._id },
    {
      $setOnInsert: {
        booking: booking._id,
        payment: payment._id,
        tx_ref: payment.tx_ref,
        ticketNumber,
        qrCodeData: buildTicketVerificationUrl(ticketNumber),

        passengerName: booking.fullName,
        passengerEmail: booking.email,
        passengerPhone: booking.phone,

        trip: {
          from: booking.trip.from,
          to: booking.trip.to,
          date: booking.trip.date,
          time: booking.trip.time,
        },

        seats: seatsArray,
        numberOfSeats: seatsArray.length,

        amountPaid: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.payment_method,
        status: "VALID",
        issuedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      session,
    }
  );

  if (!ticket.qrCodeData) {
    ticket.qrCodeData = buildTicketVerificationUrl(ticket.ticketNumber);
    await ticket.save({ session });
  }

  return ticket;
};

// Shape ticket for frontend consumption
const formatTicketForResponse = (ticket, booking) => ({
  ticketNumber: ticket.ticketNumber,
  qrCodeData: ticket.qrCodeData,
  bookingRef: booking.bookingRef,
  passengerName: ticket.passengerName,
  passengerEmail: ticket.passengerEmail,
  passengerPhone: ticket.passengerPhone,
  seats: ticket.seats,
  numberOfSeats: ticket.numberOfSeats,
  trip: booking.trip || ticket.trip || null,
  amountPaid: ticket.amountPaid,
  currency: ticket.currency,
  paymentMethod: ticket.paymentMethod,
  status: ticket.status || "VALID",
  issuedAt: ticket.issuedAt,
  companyId: booking.company || null,
});


const completePaymentVerification = async ({ tx_ref, transaction_id }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!tx_ref) {
      await session.abortTransaction();
      return {
        status: "FAILED",
        message: "Missing tx_ref parameter",
      };
    }

    const payment = await Payment.findOne({ tx_ref })
      .populate({ path: "booking", populate: "trip" })
      .session(session);

    if (!payment || !payment.booking) {
      await session.abortTransaction();
      return {
        status: "FAILED",
        message: "Payment not found",
      };
    }

    const booking = payment.booking;

    if (payment.status === "SUCCESS") {
      const ticket = await ensureTicket(booking, payment, session);
      await session.commitTransaction();

      return {
        status: "SUCCESS",
        ticketUrl: `/api/ticket/${tx_ref}`,
        ticket: formatTicketForResponse(ticket, booking),
      };
    }

    if (payment.status === "PENDING_MOMO") {
      let momoStatus;
      try {
        momoStatus = await momoService.getPaymentStatus(tx_ref);
      } catch (err) {
        console.error("MoMo Verify Error:", err.message);
        return { status: "PENDING", message: "Verification delayed. Retry shortly." };
      }

      if (momoStatus === "SUCCESSFUL") {
        payment.status = "SUCCESS";
        payment.payment_method = "MOMO";
        await payment.save({ session });

        booking.status = "CONFIRMED";
        booking.paymentStatus = "PAID";
        booking.transactionId = tx_ref;
        await booking.save({ session });

        const ticket = await ensureTicket(booking, payment, session);
        await session.commitTransaction();

        generateTicket(booking, payment)
          .then(({ pdfBuffer }) => sendTicketEmail(booking, pdfBuffer))
          .catch(err => console.error("Ticket email error:", err));

        return { status: "SUCCESS", ticketUrl: `/api/ticket/${tx_ref}`, ticket };
      } else if (momoStatus === "FAILED" || momoStatus === "REJECTED") {
        payment.status = "FAILED";
        await payment.save({ session });
        await session.commitTransaction();
        return { status: "FAILED", message: "Mobile money prompt was rejected or failed." };
      }

      await session.abortTransaction();
      return { status: "PENDING", message: "Mobile money prompt still pending on your phone." };
    }

    let flwResponse;

    try {
      flwResponse = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        {
          headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
          timeout: 20000,
        }
      );
    } catch (err) {
      await session.abortTransaction();
      console.error("FLW Verify Error:", err.response?.data || err.message);

      return {
        status: "PENDING",
        message: "Verification delayed. Retry shortly.",
      };
    }

    const flwData = flwResponse.data?.data;

    if (!flwData || flwData.status !== "successful") {
      await session.abortTransaction();

      return {
        status: "PENDING",
        message: "Payment not confirmed yet",
      };
    }

    if (
      Number(flwData.amount) !== Number(payment.amount) ||
      flwData.currency !== payment.currency
    ) {
      payment.status = "FAILED";
      payment.raw_response = flwData;
      await payment.save({ session });

      await session.commitTransaction();

      return {
        status: "FAILED",
        message: "Amount or currency mismatch",
      };
    }

    payment.status = "SUCCESS";
    payment.payment_method = flwData.payment_type;
    payment.transaction_id = flwData.id;
    payment.flw_ref = flwData.flw_ref;
    payment.raw_response = flwData;

    await payment.save({ session });

    booking.status = "CONFIRMED";
    booking.paymentStatus = "PAID";
    booking.transactionId = String(flwData.id);

    await booking.save({ session });

    const ticket = await ensureTicket(booking, payment, session);

    await session.commitTransaction();

    // 📧 Send ticket confirmation email (non-blocking, outside transaction)
    generateTicket(booking, payment)
      .then(({ pdfBuffer }) => sendTicketEmail(booking, pdfBuffer))
      .catch(err => console.error("❌ Ticket email error:", err));

    return {
      status: "SUCCESS",
      ticketUrl: `/api/ticket/${tx_ref}`,
      ticket: formatTicketForResponse(ticket, booking),
    };
  } catch (err) {
    await session.abortTransaction();
    console.error("VERIFY ERROR:", err);

    return {
      status: "FAILED",
      message: "Verification failed",
    };
  } finally {
    session.endSession();
  }
};

/* ======================================
   INITIATE PAYMENT
====================================== */
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId, bookingRef, amount, currency } = req.body;

    if (!bookingId && !bookingRef) {
      return res.status(400).json({
        message: "Booking ID or Booking Reference is required",
      });
    }

    let booking;

    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      booking = await Booking.findById(bookingId).populate("trip");
    }

    if (!booking && bookingRef) {
      booking = await Booking.findOne({ bookingRef }).populate("trip");
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    const finalAmount = amount || booking.totalPrice;
    const finalCurrency = currency || booking.currency || "RWF";
    const redirectUrl = `${BACKEND_URL}/api/payments/callback`;

    let payment = await Payment.findOne({
      booking: booking._id,
      status: "PENDING",
      amount: finalAmount,
      currency: finalCurrency,
    }).sort({ createdAt: -1 });

    if (payment?.checkoutLink && payment.checkoutRedirectUrl === redirectUrl) {
      return res.status(200).json({
        status: "SUCCESS",
        paymentLink: payment.checkoutLink,
        tx_ref: payment.tx_ref,
        reused: true,
      });
    }

    if (payment?.status === "PENDING_MOMO") {
      return res.status(200).json({
        status: "PENDING_MOMO",
        tx_ref: payment.tx_ref,
        message: "Payment is already awaiting your PIN code on your phone.",
      });
    }

    if (!payment) {
      payment = await Payment.create({
        booking: booking._id,
        tx_ref: `XP-${Date.now()}`,
        amount: finalAmount,
        currency: finalCurrency,
        status: "PENDING",
      });
    }

    const isMomo = req.body.paymentMethod === "MOMO"; // Only use raw MoMo API if explicitly requested, otherwise use Flutterwave hosted link

    if (isMomo) {
      try {
        const response = await momoService.requestToPay({
          amount: payment.amount,
          currency: "EUR", // Defaulting to EUR for sandbox rules
          phone: booking.phone,
          externalId: booking.bookingRef,
          payerMessage: `Quickbook ${booking.bookingRef}`,
        });

        payment.tx_ref = response.tx_ref;
        payment.status = "PENDING_MOMO";
        await payment.save();

        return res.status(200).json({
          status: "PENDING_MOMO",
          tx_ref: payment.tx_ref,
          message: "Check your phone to enter your MoMo PIN.",
        });
      } catch (momoErr) {
        console.error("MoMo Direct Push Error:", momoErr);
        throw new Error("Mobile Money Push Failed.");
      }
    }

    // Default Flutterwave Flow
    const payload = {
      tx_ref: payment.tx_ref,
      amount: payment.amount,
      currency: payment.currency,
      redirect_url: redirectUrl,
      customer: {
        email: booking.email,
        name: booking.fullName,
        phonenumber: booking.phone,
      },
      customizations: {
        title: "Ingendohub Ticket Payment",
        description: `Payment for booking ${booking.bookingRef}`,
      },
    };

    const response = await createFlutterwaveCheckout(payload);
    const paymentLink = response.data?.data?.link;

    if (!paymentLink) {
      throw new Error("Flutterwave did not return a checkout link");
    }

    payment.checkoutLink = paymentLink;
    payment.checkoutRedirectUrl = redirectUrl;
    payment.lastInitiationError = undefined;
    await payment.save();

    return res.status(200).json({
      status: "SUCCESS",
      paymentLink,
      tx_ref: payment.tx_ref,
    });

  } catch (error) {
    const details = error.response?.data || { message: error.message };
    console.error("InitiatePayment error:", details);

    if (isRetryableFlutterwaveError(error)) {
      return res.status(503).json({
        status: "RETRYABLE",
        retryable: true,
        retryAfter: getRetryAfter(error),
        message:
          "Flutterwave is temporarily busy. Please try again shortly; your booking is still reserved.",
      });
    }

    return res.status(500).json({
      status: "FAILED",
      retryable: false,
      message: error.message || "Payment initiation failed",
    });
  }
};

/* ======================================
   VERIFY PAYMENT (FINAL PRODUCTION VERSION)
====================================== */
exports.verifyPayment = async (req, res) => {
  res.set("Cache-Control", "no-store");

  const result = await completePaymentVerification({
    tx_ref: req.query.tx_ref,
    transaction_id: req.query.transaction_id,
  });

  return res.status(200).json(result);
};

/* ======================================
   FLUTTERWAVE REDIRECT CALLBACK
   Verifies on the server, then sends the user to the ticket.
====================================== */
exports.paymentCallback = async (req, res) => {
  res.set("Cache-Control", "no-store");

  const { tx_ref, transaction_id } = req.query;

  const result = await completePaymentVerification({
    tx_ref,
    transaction_id,
  });

  if (result.status === "SUCCESS") {
    return res.redirect(302, `${FRONTEND_URL}/ticket/${encodeURIComponent(tx_ref)}`);
  }

  if (result.status === "PENDING") {
    const query = new URLSearchParams({
      transaction_id: transaction_id || "",
      status: "pending",
    });

    return res.redirect(
      302,
      `${FRONTEND_URL}/payment/success/${encodeURIComponent(tx_ref)}?${query}`
    );
  }

  const query = new URLSearchParams({
    reason: result.message || "Payment verification failed",
  });

  return res.redirect(302, `${FRONTEND_URL}/payment/failed?${query}`);
};






