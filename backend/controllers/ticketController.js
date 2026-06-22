const Ticket = require("../models/ticketModel");
const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");
const generateTicket = require("../utils/generateTicket");
const { buildTicketVerificationUrl } = require("../utils/ticketVerification");

/* ======================================
   FORMAT TICKET (Reusable)
====================================== */
const formatTicket = (ticketDoc) => {
  const booking = ticketDoc.booking;

  return {
    ticketNumber: ticketDoc.ticketNumber,
    qrCodeData:
      ticketDoc.qrCodeData || buildTicketVerificationUrl(ticketDoc.ticketNumber),
    bookingRef: booking?.bookingRef,
    passengerName: ticketDoc.passengerName,
    passengerEmail: ticketDoc.passengerEmail,
    passengerPhone: ticketDoc.passengerPhone,
    seats: ticketDoc.seats,
    numberOfSeats: ticketDoc.numberOfSeats,

    // Always prefer booking.trip (single source of truth)
    trip: booking?.trip || null,

    amountPaid: ticketDoc.amountPaid,
    currency: ticketDoc.currency,
    paymentMethod: ticketDoc.paymentMethod,
    status: ticketDoc.status,
    issuedAt: ticketDoc.issuedAt,

    // Ensure companyId ALWAYS exists
    companyId: ticketDoc.companyId || booking?.company || null,
  };
};

/* ======================================
   GET TICKET BY TX_REF (PAYMENT FLOW)
====================================== */
exports.getTicketByTxRef = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    if (!tx_ref) {
      return res.status(400).json({ message: "tx_ref is required" });
    }

    const payment = await Payment.findOne({ tx_ref }).populate({
      path: "booking",
      populate: { path: "trip" },
    });

    if (!payment || !payment.booking) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "SUCCESS") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const booking = payment.booking;

    let ticket = await Ticket.findOne({ booking: booking._id }).populate({
      path: "booking",
      populate: { path: "trip" },
    });

    // Generate if missing (important fix)
    if (!ticket) {
      const generated = await generateTicket(booking, payment);
      ticket = await Ticket.findById(generated.ticket._id).populate({
        path: "booking",
        populate: { path: "trip" },
      });
    }

    return res.status(200).json({ ticket: formatTicket(ticket) });

  } catch (error) {
    console.error("GetTicketByTxRef error:", error);
    res.status(500).json({ message: "Server error while fetching ticket" });
  }
};

/* ======================================
   DOWNLOAD TICKET PDF BY TX_REF / BOOKING REF
====================================== */
exports.downloadTicketPdf = async (req, res) => {
  try {
    const reference = req.params.tx_ref || req.params.reference;

    if (!reference) {
      return res.status(400).json({ message: "Ticket reference is required" });
    }

    let payment = await Payment.findOne({ tx_ref: reference }).populate({
      path: "booking",
      populate: { path: "trip" },
    });

    if (!payment) {
      const booking = await Booking.findOne({ bookingRef: reference }).populate("trip");

      if (!booking) {
        return res.status(404).json({ message: "Ticket not found" });
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

    if (!payment || !payment.booking) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "SUCCESS") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const { ticket, pdfBuffer } = await generateTicket(payment.booking, payment);
    const fileName = `XPRESI-Ticket-${ticket.ticketNumber}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("DownloadTicketPdf error:", error);
    return res.status(500).json({ message: "Server error while generating PDF" });
  }
};

/* ======================================
   GET TICKET BY TICKET NUMBER (QR / PUBLIC)
====================================== */
exports.getTicketByNumber = async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    if (!ticketNumber) {
      return res.status(400).json({ message: "Ticket number is required" });
    }

    const ticket = await Ticket.findOne({ ticketNumber })
      .populate({
        path: "booking",
        populate: { path: "trip" },
      });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({ ticket: formatTicket(ticket) });

  } catch (error) {
    console.error("GetTicketByNumber error:", error);
    res.status(500).json({ message: "Server error while fetching ticket" });
  }
};

/* ======================================
   VERIFY TICKET QR CODE
====================================== */
exports.verifyTicketByNumber = async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    if (!ticketNumber) {
      return res.status(400).json({
        valid: false,
        message: "Ticket number is required",
      });
    }

    const ticket = await Ticket.findOne({ ticketNumber })
      .populate({
        path: "booking",
        populate: { path: "trip" },
      })
      .populate("payment");

    if (!ticket) {
      return res.status(404).json({
        valid: false,
        message: "Ticket not found",
      });
    }

    if (!ticket.qrCodeData) {
      ticket.qrCodeData = buildTicketVerificationUrl(ticket.ticketNumber);
      await ticket.save();
    }

    const isPaid = ticket.payment?.status === "SUCCESS";
    const isValid = ticket.status === "VALID" && isPaid;

    return res.status(200).json({
      valid: isValid,
      message: isValid ? "Ticket is valid" : "Ticket is not valid",
      paymentStatus: ticket.payment?.status || "UNKNOWN",
      ticket: formatTicket(ticket),
    });
  } catch (error) {
    console.error("VerifyTicketByNumber error:", error);
    return res.status(500).json({
      valid: false,
      message: "Server error while verifying ticket",
    });
  }
};

/* ======================================
   GET ALL TICKETS (ADMIN / COMPANY)
====================================== */
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate({
        path: "booking",
        populate: { path: "trip" },
      })
      .sort({ createdAt: -1 });

    const ticketList = tickets.map(formatTicket);

    res.status(200).json(ticketList);

  } catch (error) {
    console.error("GetAllTickets error:", error);
    res.status(500).json({ message: "Server error while fetching tickets" });
  }
};
