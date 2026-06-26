import { useEffect, useState } from "react";
import { FiDownload, FiEye, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/private/axiosPrivate";
import SuggestedDeals from "../../components/SuggestedDeals";

const MyTrips = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get("/user/bookings");
        setBookings(data?.bookings || []);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const from = (b.trip?.from || "").toLowerCase();
    const to   = (b.trip?.to   || "").toLowerCase();
    const ref  = (b.bookingRef  || "").toLowerCase();
    return from.includes(q) || to.includes(q) || ref.includes(q);
  });

  const statusColors = {
    CONFIRMED: { color: "var(--primary)",  bg: "var(--primary-soft)" },
    CANCELLED: { color: "var(--danger)",   bg: "rgba(229,62,62,0.1)" },
    PENDING:   { color: "#ca8a04",         bg: "rgba(251,191,36,0.12)" },
  };

  return (
    <>
      {/* ===== PAGE HEADER ===== */}
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: "0 0 6px" }}>My Bookings &amp; Tickets</h1>
          <p style={{ margin: 0 }}>Access your upcoming trips and past travel history.</p>
        </div>
        <div className="form-group-dash" style={{ width: 260, margin: 0 }}>
          <div style={{ position: "relative" }}>
            <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search by route or ref…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      {loading ? (
        <p style={{ color: "var(--muted)", padding: "20px 0" }}>Loading tickets…</p>
      ) : filtered.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", maxWidth: "100%" }}>
          <p style={{ color: "var(--muted)", fontSize: 16, margin: 0 }}>
            {bookings.length === 0 ? "You have no bookings or tickets yet." : "No results match your search."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((b) => {
            const trip   = b.trip || {};
            const from   = trip.from  || "—";
            const to     = trip.to    || "—";
            const date   = trip.date  || null;
            const time   = trip.time  || "—";
            const seats  = b.seats != null ? b.seats : "—";
            const ref    = b.bookingRef || b._id || "";
            const status = (b.status || "PENDING").toUpperCase();

            const dateObj  = date ? new Date(date) : null;
            const monthStr = dateObj ? dateObj.toLocaleString("default", { month: "short" }).toUpperCase() : "—";
            const dayStr   = dateObj ? dateObj.getDate() : "—";

            const { color: sColor, bg: sBg } = statusColors[status] || statusColors.PENDING;

            return (
              <div key={b._id} className="trip-card-row">
                {/* LEFT: Date badge + Route */}
                <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}>
                  {/* Date badge */}
                  <div className="trip-date-badge">
                    <span className="month">{monthStr}</span>
                    <span className="day">{dayStr}</span>
                  </div>

                  {/* Route + meta */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {from} → {to}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 5 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: 13 }}>
                        {dateObj ? dateObj.toLocaleDateString() : "—"}
                      </span>
                      <span style={{ color: "var(--border)" }}>•</span>
                      <span style={{ color: "var(--muted)", fontSize: 13 }}>{time}</span>
                      <span style={{ color: "var(--border)" }}>•</span>
                      <span style={{ color: "var(--muted)", fontSize: 13 }}>
                        {seats} {seats === 1 ? "Seat" : "Seats"}
                      </span>
                      <span style={{ display: "inline-block", background: sBg, color: sColor, padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
                        {status}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", letterSpacing: 0.2 }}>
                      Ref: {ref}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Action Buttons */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    className="btn-trip-action"
                    onClick={() => navigate(`/booking-summary/${ref}`)}
                  >
                    <FiEye size={14} /> View
                  </button>
                  <button
                    className="btn-trip-download"
                    disabled={status !== "CONFIRMED"}
                    onClick={() => {
                      if (status === "CONFIRMED") {
                        window.open(`${process.env.REACT_APP_API_URL || "http://localhost:3001/api"}/payments/ticket/${ref}/pdf`, "_blank");
                      }
                    }}
                  >
                    <FiDownload size={14} /> E-Ticket
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SuggestedDeals />
    </>
  );
};

export default MyTrips;