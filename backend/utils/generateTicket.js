const PDFDocument = require("pdfkit");
const Ticket = require("../models/ticketModel");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { buildTicketVerificationUrl } = require("./ticketVerification");

const generateTicketNumber = () =>
  `XP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

const generateTicket = async (booking, payment, saveToFile = false) => {
  if (!booking || !payment) {
    throw new Error("Booking and payment are required.");
  }

  // =========================
  // PREP DATA
  // =========================
  const trip = booking.trip || {};

  const tripInfo = {
    from: trip.from || "Unknown",
    to: trip.to || "Unknown",
    date: trip.date ? new Date(trip.date) : new Date(),
    time: trip.time || "TBD",
  };

  const seatsArray = Array.isArray(booking.seats)
    ? booking.seats.map(String)
    : [String(booking.seats || "N/A")];

  // =========================
  // IDEMPOTENCY CHECK (CRITICAL)
  // =========================
  let ticket = await Ticket.findOne({ booking: booking._id });

  if (ticket) {
    console.log("🎟️ Existing ticket found:", ticket._id);
  } else {
    console.log("🎟️ Creating new ticket...");

    try {
      ticket = await Ticket.create({
        booking: booking._id,
        payment: payment._id,
        tx_ref: payment.tx_ref, // ✅ VERY IMPORTANT

        ticketNumber: generateTicketNumber(),

        passengerName: booking.fullName || "Unknown Passenger",
        passengerEmail: booking.email || "",
        passengerPhone: booking.phone || "",

        trip: tripInfo,

        seats: seatsArray,
        numberOfSeats: seatsArray.length,

        amountPaid: payment.amount || booking.totalPrice || 0,
        currency: payment.currency || booking.currency || "RWF",
        paymentMethod: payment.payment_method || "MOMO",

        status: "VALID",
        issuedAt: new Date(),
      });

      console.log("✅ Ticket created:", ticket._id);
    } catch (err) {
      // Handle race condition (duplicate insert)
      if (err.code === 11000) {
        console.warn("⚠️ Duplicate ticket prevented, fetching existing...");
        ticket = await Ticket.findOne({ booking: booking._id });
      } else {
        console.error("❌ Ticket creation error:", err);
        throw err;
      }
    }
  }

  const qrCodeData = ticket.qrCodeData || buildTicketVerificationUrl(ticket.ticketNumber);

  if (!ticket.qrCodeData) {
    ticket.qrCodeData = qrCodeData;
    await ticket.save();
  }

  // =========================
  // GENERATE PDF
  // =========================
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const pdfBuffer = await new Promise((resolve, reject) => {
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.fontSize(22).text("Xpresi e-Ticket", { align: "center" }).moveDown(0.5);
    doc.fontSize(10).text("Scan the QR code to verify this ticket.", {
      align: "center",
    });
    doc.moveDown(1.5);

    // Ticket Info
    doc.fontSize(14).text(`Ticket Number: ${ticket.ticketNumber}`);
    doc.text(`Passenger: ${ticket.passengerName}`);
    doc.text(`Phone: ${ticket.passengerPhone}`);
    doc.text(`Email: ${ticket.passengerEmail}`);
    doc.text(`Seats: ${seatsArray.join(", ")}`);
    doc.text(`Number of Seats: ${ticket.numberOfSeats}`);
    doc.moveDown(0.5);

    // Trip Info
    doc.text(`Route: ${tripInfo.from} to ${tripInfo.to}`);
    doc.text(`Date: ${tripInfo.date.toDateString()}`);
    doc.text(`Time: ${tripInfo.time}`);
    doc.moveDown(0.5);

    // Payment Info
    doc.text(`Total Paid: ${ticket.amountPaid} ${ticket.currency}`);
    doc.text(`Payment Method: ${ticket.paymentMethod}`);
    doc.text(`Ticket Status: ${ticket.status}`);
    doc.moveDown(0.5);

    // Timestamp
    doc.fontSize(10).text(
      `Generated at: ${new Date().toLocaleString()}`,
      { align: "right" }
    );

    // QR Code
    QRCode.toBuffer(qrCodeData, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    })
      .then((qrBuffer) => {
        doc.image(qrBuffer, doc.page.width - 175, 52, { width: 125 });
        doc.fontSize(8).text("Verify QR", doc.page.width - 175, 180, {
          width: 125,
          align: "center",
        });
        doc.fontSize(8).text(qrCodeData, 50, doc.page.height - 90, {
          width: doc.page.width - 100,
          align: "center",
        });
        doc.end();
      })
      .catch((err) => {
        console.error("QR generation failed:", err);
        doc.end();
      });
  });

  // =========================
  // OPTIONAL FILE SAVE
  // =========================
  if (saveToFile) {
    const ticketsDir = path.join(__dirname, "../tickets");

    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir);
    }

    const filePath = path.join(
      ticketsDir,
      `ticket-${ticket.ticketNumber}.pdf`
    );

    fs.writeFileSync(filePath, pdfBuffer);
  }

  return { ticket, pdfBuffer };
};

module.exports = generateTicket;
