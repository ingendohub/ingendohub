import { useEffect, useRef, useState } from "react";
import {
  useParams,
  useSearchParams,
  useOutletContext,
  useNavigate,
} from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const PaymentSuccess = () => {
  const { tx_ref } = useParams();
  const [searchParams] = useSearchParams();
  const outletContext = useOutletContext();
  const isDashboard = !!outletContext;
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

  const [status, setStatus] = useState("verifying");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);
  const hasVerified = useRef(false);
  const openedFromCheckoutTab =
    typeof window !== "undefined" && window.opener && !window.opener.closed;

  useEffect(() => {
    if (!openedFromCheckoutTab) return;

    try {
      window.opener.location.assign(window.location.href);
      window.close();
    } catch (error) {
      console.error("Unable to return payment page to opener:", error);
    }
  }, [openedFromCheckoutTab]);

  /* =========================================================
     REDIRECT LOGIC
  ========================================================= */
  useEffect(() => {
    if (openedFromCheckoutTab) return;

    const user = JSON.parse(localStorage.getItem("user"));
    if (user && !isDashboard) {
      navigate(
        `/dashboard/payment-success/${tx_ref}${window.location.search}`,
        { replace: true }
      );
    }
  }, [tx_ref, isDashboard, navigate, openedFromCheckoutTab]);

  /* =========================================================
     VERIFY PAYMENT (FINAL STABLE VERSION)
  ========================================================= */
  useEffect(() => {
    if (openedFromCheckoutTab || !tx_ref || hasVerified.current) return;

    const transaction_id = searchParams.get("transaction_id");

    let attempts = 0;
    const maxAttempts = 15;
    const retryInterval = 3000;

    let timeoutId = null;
    let isRequestInFlight = false;

    const verifyPayment = async () => {
      if (hasVerified.current || isRequestInFlight) return;

      isRequestInFlight = true;

      console.log(`🔁 Attempt ${attempts + 1} for ${tx_ref}`);

      try {
        const url = `${API_URL}/payments/verify?tx_ref=${tx_ref}${
          transaction_id ? `&transaction_id=${transaction_id}` : ""
        }&_t=${Date.now()}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        const data = await res.json();

        console.log("📦 VERIFY RESPONSE:", data.status);

        /* ================= SUCCESS ================= */
        if (data.status === "SUCCESS") {
          if (!data.ticket) {
            console.warn("⚠️ Success but ticket missing");

            hasVerified.current = true;
            setStatus("failed");
            setError("Ticket generation failed. Contact support.");
            return;
          }

          if (!isMounted.current) return;

          console.log("✅ PAYMENT VERIFIED (FRONTEND)");

          setTicket(data.ticket);
          setStatus("success");
          hasVerified.current = true;
          return;
        }

        /* ================= FAILED ================= */
        if (data.status === "FAILED") {
          if (!isMounted.current) return;

          console.error("❌ PAYMENT FAILED:", data.message);

          setStatus("failed");
          setError(data.message || "Payment verification failed");
          hasVerified.current = true;
          return;
        }

        /* ================= PENDING ================= */
        attempts++;

        console.log(`⏳ Pending... retry ${attempts}/${maxAttempts}`);

        if (attempts < maxAttempts) {
          timeoutId = setTimeout(() => {
            isRequestInFlight = false;
            verifyPayment();
          }, retryInterval);
        } else {
          if (!isMounted.current) return;

          console.error("❌ Verification timeout");

          setStatus("failed");
          setError("Verification timeout. Please refresh.");
          hasVerified.current = true;
        }

      } catch (err) {
        console.error("❌ Network error:", err);

        attempts++;

        if (attempts < maxAttempts) {
          timeoutId = setTimeout(() => {
            isRequestInFlight = false;
            verifyPayment();
          }, retryInterval);
        } else {
          if (!isMounted.current) return;

          setStatus("failed");
          setError("Network error. Please try again.");
          hasVerified.current = true;
        }
      }
    };

    verifyPayment();

    return () => {
      isMounted.current = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [tx_ref, searchParams, openedFromCheckoutTab]);

  /* =========================================================
     UI STATES
  ========================================================= */

  if (status === "verifying") {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2>
          {openedFromCheckoutTab
            ? "Returning to Xpresi..."
            : "Verifying your payment..."}
        </h2>
        <p>
          {openedFromCheckoutTab
            ? "You can close this tab if it does not close automatically."
            : "Please wait a few seconds."}
        </p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2>Payment Verification Failed</h2>
        <p>{error || "Unknown error occurred."}</p>

        <button
          style={{ marginTop: 20, padding: "10px 20px" }}
          onClick={() => navigate(isDashboard ? "/dashboard" : "/")}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!ticket) return null;

  /* =========================================================
     PROCESS SEATS
  ========================================================= */

  const seatsArray = Array.isArray(ticket.seats)
    ? ticket.seats
    : ticket.seats?.split
    ? ticket.seats.split(",").map((s) => s.trim())
    : ticket.seats && typeof ticket.seats === "object"
    ? Object.keys(ticket.seats)
    : [];

  const seatsDisplay = seatsArray.length
    ? seatsArray.join(", ")
    : "Seat info unavailable";

  const seatCount = seatsArray.length;

  const generatedTime = new Date(
    ticket.issuedAt || ticket.createdAt || Date.now()
  ).toLocaleString();
  const qrCodeData =
    ticket.qrCodeData ||
    `${API_URL}/ticket/verify/${encodeURIComponent(
      ticket.ticketNumber
    )}`;

  /* =========================================================
     RENDER SUCCESS UI
  ========================================================= */

  return (
    <div style={{ maxWidth: 750, margin: "40px auto", padding: 20 }}>
      <h1 style={{ textAlign: "center", color: "#0d6efd" }}>
        Thanks for booking your e-Ticket with Xpresi
      </h1>

      <div
        style={{
          border: "2px solid #0d6efd",
          borderRadius: 12,
          padding: 30,
          background: "#f8f9fa",
          marginTop: 30,
          display: "flex",
          flexDirection: "row",
          gap: 20,
        }}
      >
        {/* LEFT SIDE */}
        <div style={{ flex: 1 }}>
          <h2 style={{ borderBottom: "1px solid #0d6efd", paddingBottom: 5 }}>
            Xpresi e-Ticket
          </h2>

          <p><strong>Booking Ref:</strong> {ticket.bookingRef}</p>
          <p><strong>Passenger:</strong> {ticket.passengerName}</p>
          <p><strong>Phone:</strong> {ticket.passengerPhone}</p>
          <p><strong>Email:</strong> {ticket.passengerEmail}</p>
          <p><strong>Seat Number(s):</strong> {seatsDisplay}</p>
          <p><strong>Total Seats:</strong> {seatCount}</p>
          <p><strong>Company ID:</strong> {ticket.companyId || "N/A"}</p>

          <hr />

          <h3>🚌 Trip Details</h3>
          {ticket.trip ? (
            <>
              <p><strong>Route:</strong> {ticket.trip.from} → {ticket.trip.to}</p>
              <p><strong>Date:</strong> {new Date(ticket.trip.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {ticket.trip.time}</p>
            </>
          ) : (
            <p>Trip details unavailable</p>
          )}

          <hr />

          <p><strong>Total Paid:</strong> {ticket.amountPaid} {ticket.currency}</p>
          <p><strong>Payment Method:</strong> {ticket.paymentMethod}</p>
          <p><strong>Booking Status:</strong> {ticket.status}</p>

          <p style={{ fontSize: 12, color: "#555" }}>
            Ticket generated at: {generatedTime}
          </p>
        </div>

        {/* QR CODE */}
        <div
          style={{
            width: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <QRCodeCanvas value={qrCodeData} size={120} />
        </div>
      </div>

      {/* DOWNLOAD BUTTON */}
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <a
          href={`${API_URL}/payments/ticket/${tx_ref}/pdf`}
          target="_blank"
          rel="noreferrer"
          download
          style={{
            padding: "12px 28px",
            background: "#0d6efd",
            color: "#fff",
            borderRadius: 6,
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Download PDF Ticket
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess;
