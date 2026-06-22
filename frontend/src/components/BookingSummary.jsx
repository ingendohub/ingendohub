import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import Loader from "./Loader";
import api from "../api/public/axiosPublic";
import {
  FiMapPin, FiClock, FiUsers, FiDollarSign,
  FiArrowRight, FiCreditCard, FiSmartphone, FiCheckCircle,
  FiAlertCircle, FiXCircle, FiDownload
} from "react-icons/fi";

const BookingSummary = () => {
  const { bookingRef } = useParams();
  const navigate = useNavigate();

  // ===== DASHBOARD CONTEXT =====
  const outletContext = useOutletContext();
  const safeSetBookingInProgress = useMemo(
    () => outletContext?.setBookingInProgress || (() => {}),
    [outletContext?.setBookingInProgress]
  );

  // ===== STATES =====
  const [booking, setBooking]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [processing, setProcessing]     = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const fetchedRef = useRef(false);

  // ===== FETCH BOOKING =====
  useEffect(() => {
    if (!bookingRef || fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError(null);
        const ref = bookingRef.toUpperCase();
        const { data } = await api.get(`/bookings/${ref}`);
        if (data.booking) {
          setBooking(data.booking);
          if (data.booking.paymentStatus !== "PAID" && data.booking.status !== "CANCELLED") {
            safeSetBookingInProgress(true);
          }
        } else {
          setError("Booking not found.");
        }
      } catch (err) {
        console.error("Booking fetch error:", err);
        setError(
          err.response?.status === 404 ? "Booking not found. Check your reference." :
          err.response?.status === 429 ? "Too many requests. Try again later." :
          "Failed to load booking. Please refresh the page."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingRef, safeSetBookingInProgress]);

  // ===== UNLOCK DASHBOARD =====
  useEffect(() => {
    if (!booking) return;
    if (booking.paymentStatus === "PAID" || booking.status === "CANCELLED") {
      safeSetBookingInProgress(false);
    }
  }, [booking, safeSetBookingInProgress]);

  // ===== PAYMENT HANDLER =====
  const handlePayment = async (method = "FLUTTERWAVE") => {
    if (!booking || booking.status === "CANCELLED") return;
    const checkoutWindow = window.open("about:blank", "xpresi_flutterwave_checkout");

    try {
      setProcessing(true);
      setPaymentMessage("");

      const payload = {
        bookingId:     booking._id,
        bookingRef:    booking.bookingRef,
        amount:        Number(booking.totalPrice),
        email:         booking.email || booking.passengerEmail,
        phone:         booking.phone || booking.passengerPhone,
        name:          booking.fullName || booking.passengerName,
        paymentMethod: method,
      };

      let data = null;
      let lastRetryMessage = "";

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await api.post("/payments/initiate", payload);
          data = response.data;
          break;
        } catch (err) {
          const retryable = err.response?.data?.retryable;
          if (!retryable || attempt === 2) throw err;
          lastRetryMessage = err.response?.data?.message || "Payment gateway is busy. Retrying…";
          setPaymentMessage(lastRetryMessage);
          await new Promise((res) => setTimeout(res, 5000));
        }
      }

      if (data.status === "PENDING_MOMO") {
        setPaymentMessage("Prompt sent to your phone. Enter your PIN to authorize payment…");
        const pollInterval = setInterval(async () => {
          try {
            const verifyRes = await api.get(`/payments/verify?tx_ref=${data.tx_ref}`);
            if (verifyRes.data.status === "SUCCESS") {
              clearInterval(pollInterval);
              setPaymentMessage("Payment Successful! Generating your ticket…");
              setTimeout(() => window.location.reload(), 2000);
            } else if (verifyRes.data.status === "FAILED") {
              clearInterval(pollInterval);
              setPaymentMessage("Payment Failed. The prompt was rejected or timed out.");
              setProcessing(false);
            }
          } catch (pollErr) {
            console.error("Polling error", pollErr);
          }
        }, 4000);
        return;
      }

      if (data.paymentLink) {
        setPaymentMessage("Secure payment opened in a new tab.");
        if (checkoutWindow) {
          checkoutWindow.location.href = data.paymentLink;
          checkoutWindow.focus();
        } else {
          window.location.assign(data.paymentLink);
        }
      } else {
        throw new Error(lastRetryMessage || "Payment link not received from backend.");
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      setPaymentMessage(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message ||
        "Failed to initiate payment."
      );
      if (checkoutWindow && !checkoutWindow.closed) checkoutWindow.close();
    } finally {
      setProcessing(false);
    }
  };

  // ===== RENDER STATES =====
  if (loading) return <Loader />;

  if (error) return (
    <div style={{ maxWidth: 580, margin: "60px auto", padding: "0 20px" }}>
      <div style={{
        background: "rgba(229,62,62,0.08)",
        border: "1px solid rgba(229,62,62,0.25)",
        borderRadius: 14,
        padding: "28px 32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}>
        <FiAlertCircle size={40} style={{ color: "var(--danger)" }} />
        <p style={{ color: "var(--danger)", fontWeight: 600, fontSize: 16, margin: 0 }}>{error}</p>
        <button className="btn-outline" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );

  if (!booking) return (
    <div style={{ textAlign: "center", marginTop: 60, color: "var(--muted)" }}>
      Booking not found.
    </div>
  );

  const departureTime = booking.trip?.departureTime
    ? new Date(booking.trip.departureTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
    : "N/A";

  const isPaid      = booking.paymentStatus === "PAID";
  const isCancelled = booking.status === "CANCELLED";

  const statusBadge = isCancelled
    ? { label: "CANCELLED", bg: "rgba(229,62,62,0.1)",  color: "var(--danger)",  icon: <FiXCircle size={15} /> }
    : isPaid
    ? { label: "PAID",      bg: "var(--primary-soft)",  color: "var(--primary)", icon: <FiCheckCircle size={15} /> }
    : { label: "PENDING",   bg: "rgba(251,191,36,0.12)",color: "#ca8a04",        icon: <FiClock size={15} /> };

  return (
    <section style={{ maxWidth: 640, margin: "40px auto", padding: "0 20px 80px" }}>

      {/* ===== PAGE TITLE ===== */}
      <h2 style={{ fontSize: 26, fontWeight: 900, color: "var(--heading)", margin: "0 0 28px", paddingBottom: 20, borderBottom: "1.5px solid var(--border)" }}>
        Booking Summary
      </h2>

      {/* ===== BOOKING DETAIL CARD ===== */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 28,
        boxShadow: "var(--shadow)",
        marginBottom: 24,
      }}>
        {/* Status badge */}
        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: statusBadge.bg,
            color: statusBadge.color,
            padding: "6px 14px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 13,
          }}>
            {statusBadge.icon} {statusBadge.label}
          </span>
        </div>

        {/* Booking ref */}
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--muted)", fontFamily: "monospace" }}>
          Ref: <strong style={{ color: "var(--heading)", letterSpacing: 1 }}>{booking.bookingRef}</strong>
        </p>

        {/* Passenger info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px 24px", marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 3 }}>Passenger</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--heading)" }}>{booking.fullName || booking.passengerName}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 3 }}>Phone</span>
            <span style={{ fontSize: 15, color: "var(--text)" }}>{booking.phone || booking.passengerPhone}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 3 }}>Email</span>
            <span style={{ fontSize: 15, color: "var(--text)" }}>{booking.email || booking.passengerEmail}</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", margin: "0 0 20px" }} />

        {/* Trip info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FiMapPin size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, minWidth: 90 }}>ROUTE</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--heading)", display: "flex", alignItems: "center", gap: 7 }}>
              {booking.trip?.from} <FiArrowRight size={13} style={{ color: "var(--primary)" }} /> {booking.trip?.to}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FiClock size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, minWidth: 90 }}>DEPARTURE</span>
            <span style={{ fontSize: 15, color: "var(--text)" }}>{departureTime}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FiUsers size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, minWidth: 90 }}>SEATS</span>
            <span style={{ fontSize: 15, color: "var(--text)" }}>
              {Array.isArray(booking.seats) ? booking.seats.join(", ") : booking.seats}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, marginTop: 4, borderTop: "1px solid var(--border)" }}>
            <FiDollarSign size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, minWidth: 90 }}>TOTAL</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)" }}>
              {booking.totalPrice?.toLocaleString()}{" "}
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{booking.currency || "RWF"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ===== PAYMENT ACTIONS ===== */}
      {!isPaid && !isCancelled && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Card / Hosted Checkout */}
            <button
              onClick={() => handlePayment("FLUTTERWAVE")}
              disabled={processing}
              style={{
                flex: 1,
                minWidth: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "15px 24px",
                background: processing ? "var(--muted)" : "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: 50,
                fontSize: 15,
                fontWeight: 800,
                fontFamily: "inherit",
                cursor: processing ? "not-allowed" : "pointer",
                transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: processing ? "none" : "0 6px 20px var(--primary-light)",
                letterSpacing: "0.2px",
              }}
              onMouseOver={(e) => { if (!processing) { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.background = "var(--primary-dark)"; } }}
              onMouseOut={(e)  => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = processing ? "var(--muted)" : "var(--primary)"; }}
            >
              <FiCreditCard size={18} />
              {processing ? "Processing…" : "Pay (Card / MoMo)"}
            </button>

            {/* MoMo Sandbox test */}
            <button
              onClick={() => handlePayment("MOMO")}
              disabled={processing}
              style={{
                flex: 1,
                minWidth: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "15px 24px",
                background: "var(--surface)",
                color: "var(--primary)",
                border: "1.5px solid var(--primary)",
                borderRadius: 50,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: processing ? "not-allowed" : "pointer",
                transition: "all 0.25s ease",
                opacity: processing ? 0.7 : 1,
              }}
              onMouseOver={(e) => { if (!processing) { e.currentTarget.style.background = "var(--primary-soft)"; } }}
              onMouseOut={(e)  => { e.currentTarget.style.background = "var(--surface)"; }}
            >
              <FiSmartphone size={18} />
              {processing ? "…" : "Test MTN Sandbox"}
            </button>
          </div>

          {/* Payment status message */}
          {paymentMessage && (
            <div style={{
              padding: "14px 18px",
              background: paymentMessage.toLowerCase().includes("fail") || paymentMessage.toLowerCase().includes("error")
                ? "rgba(229,62,62,0.08)"
                : "var(--primary-soft)",
              border: `1px solid ${paymentMessage.toLowerCase().includes("fail") || paymentMessage.toLowerCase().includes("error")
                ? "rgba(229,62,62,0.25)"
                : "var(--primary-light)"}`,
              borderRadius: 10,
              textAlign: "center",
              color: paymentMessage.toLowerCase().includes("fail") || paymentMessage.toLowerCase().includes("error")
                ? "var(--danger)"
                : "var(--primary)",
              fontWeight: 600,
              fontSize: 14,
            }}>
              {paymentMessage}
            </div>
          )}
        </div>
      )}

      {/* ===== PAID STATE ===== */}
      {isPaid && (
        <div style={{
          background: "var(--primary-soft)",
          border: "1.5px solid var(--primary-light)",
          borderRadius: 14,
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          textAlign: "center",
        }}>
          <FiCheckCircle size={40} style={{ color: "var(--primary)" }} />
          <p style={{ color: "var(--primary)", fontWeight: 700, fontSize: 16, margin: 0 }}>
            Payment completed successfully. Your e-ticket is ready!
          </p>
          <a
            href={`http://localhost:3001/api/ticket/${booking.bookingRef}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: 50,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              transition: "all 0.25s ease",
              boxShadow: "0 4px 14px var(--primary-light)",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "var(--primary-dark)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseOut={(e)  => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.transform = "none"; }}
          >
            <FiDownload size={16} /> Download / View Ticket
          </a>
        </div>
      )}

      {/* ===== CANCELLED STATE ===== */}
      {isCancelled && (
        <div style={{
          background: "rgba(229,62,62,0.07)",
          border: "1px solid rgba(229,62,62,0.2)",
          borderRadius: 14,
          padding: "22px 28px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          <FiXCircle size={28} style={{ color: "var(--danger)", flexShrink: 0 }} />
          <p style={{ color: "var(--danger)", fontWeight: 600, fontSize: 15, margin: 0 }}>
            This booking has been cancelled.
          </p>
        </div>
      )}
    </section>
  );
};

export default BookingSummary;
