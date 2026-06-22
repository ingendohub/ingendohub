import { useEffect, useState } from "react";
import { FiShield, FiArrowRight } from "react-icons/fi";
import api from "../../api/private/axiosPrivate";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await api.get("/user/payments");
        setPayments(data?.payments || []);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const statusStyle = (status) => {
    if (status === "SUCCESS") return { bg: "var(--primary-soft)", color: "var(--primary)" };
    if (status === "FAILED")  return { bg: "rgba(229,62,62,0.1)",  color: "var(--danger)"  };
    return { bg: "rgba(251,191,36,0.12)", color: "#ca8a04" };
  };

  return (
    <>
      <div className="dashboard-header">
        <h1>Payment History</h1>
        <p>Review all your transactions made on Ingendohub.</p>
      </div>

      {/* ===== Premium Wallet Banner (theme-aligned) ===== */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)",
        borderRadius: 16,
        padding: "24px 32px",
        color: "#fff",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 20,
        boxShadow: "0 6px 24px var(--primary-light)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 20, display: "flex", alignItems: "center", gap: 8, color: "#fff" }}>
            <FiShield size={22} style={{ opacity: 0.9 }} /> Ingendohub Premium Wallet
          </h3>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", maxWidth: 560, lineHeight: 1.5, fontSize: 14 }}>
            Upgrade to Premium to enjoy 0% service fees on all bookings, priority secure transactions, and earn cashback on worldwide partner deals.
          </p>
        </div>
        <button
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "1.5px solid rgba(255,255,255,0.35)",
            padding: "11px 24px",
            borderRadius: 50,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.25s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backdropFilter: "blur(8px)",
            fontFamily: "inherit",
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
        >
          Explore Benefits <FiArrowRight size={15} />
        </button>
      </div>

      {/* ===== Transactions Table ===== */}
      <div className="dashboard-card" style={{ maxWidth: "100%", padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--surface-alt)", color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <th style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>Transaction ID</th>
              <th style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>Date</th>
              <th style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>Payment Method</th>
              <th style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>Amount</th>
              <th style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>Status</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                  <div style={{ display: "inline-block", width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>Loading payments…</p>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: 36, textAlign: "center", color: "var(--muted)", fontSize: 15 }}>
                  No transaction history found.
                </td>
              </tr>
            ) : (
              payments.map(tx => {
                const { bg, color } = statusStyle(tx.status);
                return (
                  <tr key={tx._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 24px", fontFamily: "monospace", fontSize: 13, color: "var(--muted)" }}>{tx.tx_ref || "—"}</td>
                    <td style={{ padding: "14px 24px" }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "14px 24px" }}>{tx.payment_method || "—"}</td>
                    <td style={{ padding: "14px 24px", fontWeight: 700, color: "var(--heading)" }}>
                      {(tx.amount || 0).toLocaleString()} <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{tx.currency || "RWF"}</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ background: bg, color, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Payments;
