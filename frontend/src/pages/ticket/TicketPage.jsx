import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  FiArrowLeft,
  FiDownload,
  FiExternalLink,
  FiPrinter,
  FiShield,
} from "react-icons/fi";

const TicketPage = () => {
  const { tx_ref: bookingid } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const isDashboard = !!outletContext;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState(null);

  const API_URL = "http://localhost:3001/api/payments";

  useEffect(() => {
    if (!bookingid) {
      navigate(isDashboard ? "/dashboard" : "/");
      return;
    }

    const fetchTicket = async () => {
      try {
        const res = await fetch(`${API_URL}/ticket/${bookingid}`);
        if (!res.ok) throw new Error("Ticket not found");

        const data = await res.json();
        setTicket(data.ticket);
        setLoading(false);
      } catch (err) {
        console.error("Ticket fetch error:", err);
        setError(err.message || "Unable to load ticket");
        setLoading(false);
      }
    };

    fetchTicket();
  }, [bookingid, navigate, isDashboard]);

  const pdfUrl = `${API_URL}/ticket/${bookingid}/pdf`;

  const downloadTicket = () => {
    if (!ticket?.ticketNumber) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `XPRESI-Ticket-${ticket.ticketNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printTicket = () => {
    const iframe = document.getElementById("ticket-frame");
    if (!iframe) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };

  const openNewTab = () => {
    if (!ticket?.ticketNumber) return;
    window.open(pdfUrl, "_blank");
  };

  if (error) {
    return (
      <div className="ticket-state">
        <h2>Ticket not found</h2>
        <p>{error}</p>
        <button className="ticket-primary-btn" onClick={() => navigate(isDashboard ? "/dashboard" : "/")}>
          Go back
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ticket-state">
        <h2>Loading your ticket</h2>
        <p>Please wait while we prepare your verified e-ticket.</p>
      </div>
    );
  }

  const generatedTime = new Date(ticket?.issuedAt || Date.now()).toLocaleString();
  const seatsArray = Array.isArray(ticket.seats)
    ? ticket.seats
    : typeof ticket.seats === "string"
    ? ticket.seats.split(",").map((s) => s.trim())
    : ticket.seats
    ? Object.keys(ticket.seats)
    : [];
  const seatsDisplay = seatsArray.length ? seatsArray.join(", ") : "Seat info unavailable";
  const qrCodeData =
    ticket.qrCodeData ||
    `http://localhost:3001/api/ticket/verify/${encodeURIComponent(ticket.ticketNumber)}`;

  return (
    <main className="ticket-page">
      <section className="ticket-shell">
        <div className="ticket-hero">
          <div>
            <span className="ticket-kicker"><FiShield /> Verified e-ticket</span>
            <h1>Xpresi Bus Ticket</h1>
            <p>Booking reference: <strong>{ticket.bookingRef || ticket.ticketNumber}</strong></p>
          </div>
          <div className="ticket-status-pill">{ticket.status || "VALID"}</div>
        </div>

        <div className="ticket-layout">
          <section className="ticket-card-panel">
            <div className="ticket-route-row">
              <div>
                <span>From</span>
                <strong>{ticket.trip?.from || "N/A"}</strong>
              </div>
              <div className="route-line" />
              <div>
                <span>To</span>
                <strong>{ticket.trip?.to || "N/A"}</strong>
              </div>
            </div>

            <div className="ticket-detail-grid">
              <div><span>Passenger</span><strong>{ticket.passengerName}</strong></div>
              <div><span>Phone</span><strong>{ticket.passengerPhone}</strong></div>
              <div><span>Email</span><strong>{ticket.passengerEmail}</strong></div>
              <div><span>Date</span><strong>{ticket.trip?.date ? new Date(ticket.trip.date).toLocaleDateString() : "N/A"}</strong></div>
              <div><span>Time</span><strong>{ticket.trip?.time || "N/A"}</strong></div>
              <div><span>Seats</span><strong>{seatsDisplay}</strong></div>
              <div><span>Total paid</span><strong>{ticket.amountPaid} {ticket.currency}</strong></div>
              <div><span>Payment method</span><strong>{ticket.paymentMethod || "MOMO"}</strong></div>
            </div>

            <p className="ticket-issued">Issued: {generatedTime}</p>
          </section>

          <aside className="ticket-qr-panel">
            <div className="qr-box">
              <QRCodeCanvas value={qrCodeData} size={180} />
            </div>
            <h2>Scan to verify</h2>
            <p>This QR code opens the official Xpresi ticket verification endpoint.</p>
            <code>{ticket.ticketNumber}</code>
          </aside>
        </div>

        <div className="ticket-actions">
          <button className="ticket-primary-btn" onClick={downloadTicket}><FiDownload /> Download PDF</button>
          <button className="ticket-secondary-btn" onClick={printTicket}><FiPrinter /> Print</button>
          <button className="ticket-secondary-btn" onClick={openNewTab}><FiExternalLink /> Open PDF</button>
          <button
            className="ticket-link-btn"
            onClick={() => navigate(isDashboard ? "/dashboard" : "/")}
          >
            <FiArrowLeft /> {isDashboard ? "Back to dashboard" : "Back home"}
          </button>
        </div>

        <div className="ticket-preview">
          <iframe
            id="ticket-frame"
            src={pdfUrl}
            width="100%"
            height="100%"
            title="Ticket PDF Preview"
            onError={() => setError("Unable to load ticket PDF.")}
          />
        </div>
      </section>
    </main>
  );
};

export default TicketPage;
