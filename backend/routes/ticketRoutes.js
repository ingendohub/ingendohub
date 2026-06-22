const express = require("express");
const router = express.Router();

const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");
const Ticket = require("../models/ticketModel");
const generateTicket = require("../utils/generateTicket");
const { verifyTicketByNumber } = require("../controllers/ticketController");
const { buildTicketVerificationUrl } = require("../utils/ticketVerification");

const buildBookingTicket = (booking) => ({
  bookingRef: booking.bookingRef,
  passenger: booking.fullName,
  phone: booking.phone,
  email: booking.email,
  seats: booking.seats,
  trip: booking.trip
    ? {
        from: booking.trip.from,
        to: booking.trip.to,
        date: booking.trip.date,
        time: booking.trip.time,
      }
    : null,
  totalPrice: booking.totalPrice,
  currency: booking.currency,
  paymentStatus: booking.paymentStatus,
  status: booking.status,
});

const buildPaidTicket = (ticket) => ({
  ticketNumber: ticket.ticketNumber,
  qrCodeData: ticket.qrCodeData || buildTicketVerificationUrl(ticket.ticketNumber),
  bookingRef: ticket.booking?.bookingRef,
  passenger: ticket.passengerName,
  phone: ticket.passengerPhone,
  email: ticket.passengerEmail,
  seats: ticket.seats,
  trip: ticket.trip,
  totalPrice: ticket.amountPaid,
  currency: ticket.currency,
  paymentStatus: ticket.booking?.paymentStatus || "PAID",
  status: ticket.status,
  tx_ref: ticket.tx_ref,
  issuedAt: ticket.issuedAt,
});

const findPaidTicketData = async (reference) => {
  let payment = await Payment.findOne({ tx_ref: reference }).populate({
    path: "booking",
    populate: { path: "trip" },
  });

  if (!payment) {
    const booking = await Booking.findOne({ bookingRef: reference }).populate("trip");

    if (!booking) {
      return null;
    }

    payment = await Payment.findOne({
      booking: booking._id,
      status: "SUCCESS",
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "booking",
        populate: { path: "trip" },
      });
  }

  if (!payment || !payment.booking || payment.status !== "SUCCESS") {
    return { payment, booking: payment?.booking || null, ticket: null };
  }

  let ticket = await Ticket.findOne({ booking: payment.booking._id }).populate(
    "booking"
  );

  if (!ticket) {
    const generated = await generateTicket(payment.booking, payment);
    ticket = await Ticket.findById(generated.ticket._id).populate("booking");
  }

  return { payment, booking: payment.booking, ticket };
};

router.get("/verify/:ticketNumber", verifyTicketByNumber);

router.get("/:reference/pdf", async (req, res) => {
  try {
    const { reference } = req.params;
    const result = await findPaidTicketData(reference);

    if (!result || !result.booking) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!result.payment || result.payment.status !== "SUCCESS") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const { ticket, pdfBuffer } = await generateTicket(
      result.booking,
      result.payment
    );

    const fileName = `XPRESI-Ticket-${ticket.ticketNumber}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("Ticket PDF error:", err);
    return res.status(500).json({ message: "Server error while generating PDF" });
  }
});

router.get("/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    const paidTicketData = await findPaidTicketData(reference);

    if (paidTicketData?.payment) {
      if (paidTicketData.payment.status !== "SUCCESS") {
        return res.status(400).json({ message: "Payment not completed" });
      }

      if (!paidTicketData.ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      return res.json(buildPaidTicket(paidTicketData.ticket));
    }

    const booking = await Booking.findOne({ bookingRef: reference }).populate("trip");
    if (!booking) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (booking.paymentStatus === "PAID") {
      const ticket = await Ticket.findOne({ booking: booking._id }).populate("booking");
      if (ticket) {
        return res.json(buildPaidTicket(ticket));
      }
    }

    return res.json(buildBookingTicket(booking));
  } catch (err) {
    console.error("Ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
