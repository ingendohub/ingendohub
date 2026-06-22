import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMapPin, FiRefreshCw, FiBriefcase, FiCalendar, FiClock, FiUsers, FiArrowRight, FiTruck } from "react-icons/fi";
import { searchTrips } from "../api/public/tripService";
import { useLang } from "../i18n/LanguageContext";

const RWANDAN_DISTRICTS = [
  "Kigali", "Huye", "Rubavu", "Musanze", "Nyanza", "Muhanga", "Rwamagana",
  "Nyagatare", "Kayonza", "Kirehe", "Ngoma", "Gatsibo", "Bugesera",
  "Gicumbi", "Rulindo", "Gakenke", "Burera", "Karongi", "Rutsiro", "Ngororero",
  "Nyabihu", "Rusizi", "Nyamasheke", "Nyamagabe", "Nyaruguru", "Ruhango", "Kamonyi"
];

const BookingForm = ({ onResults, allTrips = [] }) => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ from: "", to: "", date: "", agency: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultTrips, setResultTrips] = useState(null); // null = not yet searched

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear results when form changes
    if (resultTrips !== null) {
      setResultTrips(null);
    }
  };

  const uniqueFroms = useMemo(() => {
    const froms = new Set(RWANDAN_DISTRICTS);
    if (allTrips) allTrips.forEach(t => { if (t.from) froms.add(t.from); });
    return Array.from(froms).sort();
  }, [allTrips]);

  const uniqueTos = useMemo(() => {
    const tos = new Set(RWANDAN_DISTRICTS);
    if (allTrips) allTrips.forEach(t => { if (t.to) tos.add(t.to); });
    return Array.from(tos).sort();
  }, [allTrips]);

  const isValidRoute = form.from?.trim() && form.to?.trim() && allTrips.some(
    t => t.from?.toLowerCase().trim() === form.from.toLowerCase().trim() &&
         t.to?.toLowerCase().trim() === form.to.toLowerCase().trim()
  );

  const matchingAgencies = useMemo(() => {
    if (!isValidRoute || !allTrips) return [];
    const agencies = new Set();
    allTrips.forEach(t => {
      if (t.from?.toLowerCase().trim() === form.from.toLowerCase().trim() &&
          t.to?.toLowerCase().trim() === form.to.toLowerCase().trim()) {
        const agencyName = t.company?.name || t.bus?.company?.name;
        if (agencyName) agencies.add(agencyName);
      }
    });
    return Array.from(agencies);
  }, [isValidRoute, allTrips, form.from, form.to]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResultTrips(null);
    try {
      const res = await searchTrips({ from: form.from, to: form.to, date: form.date });
      let trips = res.data?.trips || res.data || [];

      // Filter by agency if selected
      if (form.agency) {
        trips = trips.filter(t => {
          const agencyName = t.company?.name || t.bus?.company?.name;
          return agencyName === form.agency;
        });
      }

      const explicitPayload = {
        searchedRoute: { from: form.from, to: form.to },
        searchedAgency: form.agency || null,
        searchedDate: form.date || null
      };

      if (trips.length === 0) {
        setError(t("booking_no_results"));
        setResultTrips([]);
        onResults([], explicitPayload);
      } else {
        setResultTrips(trips);
        onResults(trips, explicitPayload);
      }
    } catch (err) {
      setError(err.response?.data?.message || t("booking_error"));
      setResultTrips([]);
      onResults([], null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ from: "", to: "", date: "", agency: "" });
    setError("");
    setResultTrips(null);
    onResults(null, null);
  };

  const handleBookTrip = (tripId) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) {
      navigate(`/dashboard/book/${tripId}`);
    } else {
      navigate(`/book/${tripId}`);
    }
  };

  const formatTime = (trip) => {
    if (trip.departureTime) {
      const d = new Date(trip.departureTime);
      if (!isNaN(d)) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }
    if (trip.time) return trip.time;
    return "N/A";
  };

  const formatDate = (trip) => {
    if (trip.departureTime) {
      const d = new Date(trip.departureTime);
      if (!isNaN(d)) return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    }
    if (trip.date) return new Date(trip.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return "";
  };

  return (
    <div className="booking-form-wrapper">
      <div className="booking-form-card" style={{ maxWidth: '960px' }}>
        <div className="booking-form-head">
          <div>
            <span className="panel-label">{"Search Schedules"}</span>
            <h2>{"Find Your Bus Trip"}</h2>
          </div>
          <span className="panel-badge">{"Ingendohub"}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label><FiMapPin /> {t("booking_from")}</label>
              <input
                type="text"
                name="from"
                value={form.from}
                onChange={handleChange}
                placeholder={t("booking_from_placeholder")}
                list="from-options"
                required
              />
              <datalist id="from-options">
                {uniqueFroms.map(f => <option key={f} value={f} />)}
              </datalist>
            </div>

            <div className="form-group">
              <label><FiMapPin /> {t("booking_to")}</label>
              <input
                type="text"
                name="to"
                value={form.to}
                onChange={handleChange}
                placeholder={t("booking_to_placeholder")}
                list="to-options"
                required
              />
              <datalist id="to-options">
                {uniqueTos.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>

            <div className="form-group">
              <label><FiCalendar /> {t("booking_date")}</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label><FiBriefcase /> Agency</label>
              <select
                name="agency"
                value={form.agency}
                onChange={handleChange}
                className="agency-select"
              >
                <option value="">
                  {form.from && form.to && matchingAgencies.length === 0
                    ? "No agency on this route"
                    : matchingAgencies.length > 0
                    ? "All Agencies"
                    : "All Agencies"}
                </option>
                {matchingAgencies.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-btn-row">
            <button
              type="submit"
              disabled={loading}
              className="btn-search"
            >
              {loading ? t("booking_searching") : <><FiSearch size={20} /> {t("booking_search")}</>}
            </button>
          </div>

          <div className="form-helper-row">
            <span>{t("booking_tip")}</span>
            <button type="button" className="btn-reset-search" onClick={handleReset}>
              <FiRefreshCw /> {t("booking_reset")}
            </button>
          </div>
        </form>

        {error && <div className="form-error">{error}</div>}

        {/* ===== OPERATOR RESULT CARDS ===== */}
        {resultTrips !== null && resultTrips.length > 0 && (
          <div className="search-results-section">
            <p className="search-results-title">
              {resultTrips.length} trip{resultTrips.length !== 1 ? 's' : ''} found · {form.from} → {form.to}
            </p>
            <div className="search-results-grid">
              {resultTrips.map((trip) => {
                const operatorName = trip.company?.name || trip.bus?.company?.name || "Bus Operator";
                const busName = trip.bus?.name || trip.busName || "";
                const availableSeats = trip.availableSeats ?? trip.seats ?? 0;
                const pct = trip.totalSeats ? Math.round((availableSeats / trip.totalSeats) * 100) : null;

                return (
                  <div key={trip._id} className="result-operator-card">
                    <div className="result-operator-name">{operatorName}</div>
                    {busName && <div className="result-operator-bus"><FiTruck style={{ marginRight: 4 }} />{busName}</div>}

                    <div className="result-route">
                      <span>{trip.from}</span>
                      <FiArrowRight className="result-route-arrow" />
                      <span>{trip.to}</span>
                    </div>

                    <div className="result-meta">
                      <div className="result-meta-item">
                        <FiCalendar size={13} />
                        <span>{formatDate(trip)}</span>
                      </div>
                      <div className="result-meta-item">
                        <FiClock size={13} />
                        <span>{formatTime(trip)}</span>
                      </div>
                      <div className="result-meta-item">
                        <FiUsers size={13} />
                        <span>{availableSeats} seats available
                          {pct !== null && (
                            <span style={{ color: pct < 20 ? 'var(--danger)' : 'var(--muted)', marginLeft: 4, fontSize: '11px' }}>
                              ({pct}% left)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="result-price">
                      {trip.price?.toLocaleString()} <span>RWF / seat</span>
                    </div>

                    <button
                      className="btn-book-result"
                      onClick={() => handleBookTrip(trip._id)}
                      disabled={availableSeats === 0}
                      style={availableSeats === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      {availableSeats === 0 ? "Sold Out" : "Book Now →"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {resultTrips !== null && resultTrips.length === 0 && !error && (
          <div className="search-results-section">
            <div className="result-no-trips">
              <FiSearch size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>No trips found for this route on the selected date.</p>
              <p style={{ fontSize: '12px', marginTop: 4 }}>Try a different date or check the route spelling.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
