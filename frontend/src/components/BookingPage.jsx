import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import Loader from "./Loader";
import { createBooking } from "../api/public/bookingService";
import { getTripById } from "../api/public/tripService";
import { useLang } from "../i18n/LanguageContext";
import {
  FiMapPin, FiClock, FiUsers, FiDollarSign, FiArrowRight,
  FiUser, FiMail, FiPhone, FiCalendar
} from "react-icons/fi";

/* ===== East African Country Codes ===== */
const EA_COUNTRY_CODES = [
  { code: "+250", flag: "🇷🇼", label: "Rwanda (+250)" },
  { code: "+254", flag: "🇰🇪", label: "Kenya (+254)" },
  { code: "+255", flag: "🇹🇿", label: "Tanzania (+255)" },
  { code: "+256", flag: "🇺🇬", label: "Uganda (+256)" },
  { code: "+257", flag: "🇧🇮", label: "Burundi (+257)" },
  { code: "+251", flag: "🇪🇹", label: "Ethiopia (+251)" },
  { code: "+252", flag: "🇸🇴", label: "Somalia (+252)" },
  { code: "+253", flag: "🇩🇯", label: "Djibouti (+253)" },
  { code: "+291", flag: "🇪🇷", label: "Eritrea (+291)" },
];

const BookingPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const outletContext = useOutletContext() || {};
  const bookingInProgress = outletContext.bookingInProgress || false;
  const setBookingInProgress = outletContext.setBookingInProgress || (() => {});

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  let storedUser = null;
  try { storedUser = JSON.parse(localStorage.getItem("user")); } catch { storedUser = null; }

  const [form, setForm] = useState({
    fullName: storedUser?.fullName || "",
    countryCode: "+250",
    phone: storedUser?.phone?.replace(/^\+\d{3}/, "") || "",
    email: storedUser?.email || "",
    seats: 1,
  });

  // Fetch trip
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const res = await getTripById(tripId);
        const tripData = res.data?.trip || res.data;
        setTrip(tripData);
      } catch (err) {
        console.error("Trip fetch error:", err);
        alert(t("booking_page_fail"));
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchTrip();
  }, [tripId, t]);

  // ===== VALIDATION =====
  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Name must be at least 3 characters";
        return "";
      case "phone":
        if (!value) return "Phone number is required";
        if (!/^\d{9}$/.test(value.replace(/\s/g, "")))
          return "Phone must be exactly 9 digits (local number only)";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
        return "";
      case "seats":
        if (!value || Number(value) < 1) return "At least 1 seat required";
        if (trip && Number(value) > trip.availableSeats)
          return `Only ${trip.availableSeats} seats available`;
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "seats") {
      const seatValue = Math.max(1, Math.min(Number(value), trip?.availableSeats || 1));
      setForm((prev) => ({ ...prev, seats: seatValue }));
      if (touched.seats) setErrors((prev) => ({ ...prev, seats: validateField("seats", seatValue) }));
      return;
    }

    if (name === "phone") {
      // Only allow digits
      const digits = value.replace(/\D/g, "").slice(0, 9);
      setForm((prev) => ({ ...prev, phone: digits }));
      if (touched.phone) setErrors((prev) => ({ ...prev, phone: validateField("phone", digits) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const getPhoneClass = () => {
    if (!touched.phone) return "phone-input-group";
    if (errors.phone) return "phone-input-group invalid";
    if (form.phone.length === 9) return "phone-input-group valid";
    return "phone-input-group";
  };

  const getFieldClass = (name) => {
    if (!touched[name]) return "";
    return errors[name] ? "invalid" : "valid";
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Touch all fields
    const allFields = ["fullName", "phone", "email", "seats"];
    const newTouched = Object.fromEntries(allFields.map(f => [f, true]));
    const newErrors = Object.fromEntries(allFields.map(f => [f, validateField(f, form[f])]));
    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.values(newErrors).some(e => e)) return;
    if (!trip) return;

    const fullPhone = `${form.countryCode}${form.phone}`;

    try {
      setLoading(true);
      setBookingInProgress(true);

      const payload = {
        tripId,
        fullName: form.fullName.trim(),
        phone: fullPhone,
        email: form.email.trim(),
        seats: Number(form.seats),
        totalPrice: Number(trip.price) * Number(form.seats),
      };

      const res = await createBooking(payload);
      const booking = res.data?.booking;
      if (!booking || !booking.bookingRef) throw new Error("Booking reference not returned");

      const user = JSON.parse(localStorage.getItem("user") || "null");
      navigate(
        user
          ? `/dashboard/booking-summary/${booking.bookingRef}`
          : `/booking-summary/${booking.bookingRef}`
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
      setBookingInProgress(false);
    }
  };

  if (loading || !trip) return <Loader />;

  // Date formatting
  let departureDateTime = null;
  if (trip.departureTime) {
    const d = new Date(trip.departureTime);
    if (!isNaN(d)) departureDateTime = d;
  } else if (trip.date && trip.time) {
    const d = new Date(`${trip.date}T${trip.time}`);
    if (!isNaN(d)) departureDateTime = d;
  }

  const totalPrice = Number(trip.price) * Number(form.seats);
  const operatorName = trip.company?.name || trip.bus?.company?.name || "Operator";

  return (
    <div className="booking-page-section">
      <div className="booking-page-card">

        {/* ===== TITLE ===== */}
        <h2 className="booking-page-title">{t("booking_page_title")}</h2>

        {/* ===== TRIP SUMMARY ===== */}
        <div className="booking-trip-summary">
          <p>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase' }}>
              <FiMapPin size={12} /> Route
            </span>
            <span className="summary-value" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
              {trip.from} <FiArrowRight size={13} style={{ color: 'var(--primary)' }} /> {trip.to}
            </span>
          </p>
          <p>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase' }}>
              <FiClock size={12} /> Departure
            </span>
            <span className="summary-value">
              {departureDateTime
                ? departureDateTime.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
                : "N/A"}
            </span>
          </p>
          <p>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase' }}>
              <FiUsers size={12} /> Operator
            </span>
            <span className="summary-value">{operatorName}</span>
          </p>
          <p>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase' }}>
              <FiDollarSign size={12} /> Price/seat
            </span>
            <span className="summary-value">{trip.price?.toLocaleString()} RWF</span>
          </p>
          <p style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}>
              Total ({form.seats} seat{form.seats > 1 ? "s" : ""})
            </span>
            <span className="summary-total">{totalPrice.toLocaleString()} RWF</span>
          </p>
        </div>

        {/* ===== BOOKING FORM ===== */}
        <form className="booking-form" onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className="booking-field">
            <label><FiUser size={12} style={{ marginRight: 4 }} />{t("booking_page_fullname")}</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              required
              className={getFieldClass("fullName")}
            />
            {touched.fullName && errors.fullName && (
              <span className="booking-field-error">{errors.fullName}</span>
            )}
          </div>

          {/* Phone with East Africa Country Code */}
          <div className="booking-field">
            <label><FiPhone size={12} style={{ marginRight: 4 }} />{t("booking_page_phone")}</label>
            <div className={getPhoneClass()}>
              <select
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                className="country-code-select"
                aria-label="Country code"
              >
                {EA_COUNTRY_CODES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={(e) => {
                  setTouched(p => ({ ...p, phone: true }));
                  setErrors(p => ({ ...p, phone: validateField("phone", form.phone) }));
                }}
                placeholder="7XXXXXXXX (9 digits)"
                maxLength={9}
                className="phone-number-input"
                inputMode="numeric"
                pattern="\d{9}"
                aria-label="Phone number"
              />
            </div>
            {touched.phone && errors.phone && (
              <span className="booking-field-error">{errors.phone}</span>
            )}
            {touched.phone && !errors.phone && form.phone.length === 9 && (
              <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                ✓ Full number: {form.countryCode}{form.phone}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="booking-field">
            <label><FiMail size={12} style={{ marginRight: 4 }} />{t("booking_page_email")}</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              required
              className={getFieldClass("email")}
            />
            {touched.email && errors.email && (
              <span className="booking-field-error">{errors.email}</span>
            )}
          </div>

          {/* Seats */}
          <div className="booking-field">
            <label><FiUsers size={12} style={{ marginRight: 4 }} />{t("booking_page_seats")}</label>
            <input
              type="number"
              name="seats"
              min="1"
              max={trip.availableSeats}
              value={form.seats}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ maxWidth: 160 }}
              className={getFieldClass("seats")}
            />
            <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: -4 }}>
              {trip.availableSeats} seats available
            </span>
            {touched.seats && errors.seats && (
              <span className="booking-field-error">{errors.seats}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-confirm-booking"
            disabled={loading || bookingInProgress}
          >
            {loading || bookingInProgress ? t("booking_page_processing") : t("booking_page_confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;