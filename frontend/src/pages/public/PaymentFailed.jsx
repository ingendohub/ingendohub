import { Link } from "react-router-dom";

const PaymentFailed = () => {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "80px auto",
        padding: 30,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
        textAlign: "center",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ color: "#e74c3c", marginBottom: 16 }}>
        ❌ Payment Failed
      </h1>

      <p style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
        Unfortunately, your payment could not be completed.
      </p>

      <p style={{ fontSize: 15, color: "#555", marginBottom: 24 }}>
        No money was deducted. You may try again or contact our support team if
        the issue persists.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        <Link
          to="/"
          style={{
            padding: "12px 24px",
            backgroundColor: "#0066ff",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Back to Home
        </Link>

        <Link
          to="/contact"
          style={{
            padding: "12px 24px",
            backgroundColor: "#f1f1f1",
            color: "#333",
            fontWeight: 600,
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailed;

