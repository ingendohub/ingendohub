import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAllBookings, cancelBooking } from "../../api/admin/bookingService";
import { getTrips, updateTripById, deleteTripById } from "../../api/admin/tripService";
import { getAdminStats } from "../../api/admin/adminService";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     FETCH FUNCTIONS WITH DEBUG
  =============================== */

  const fetchStats = useCallback(async () => {
    try {
      console.log("===== FETCH STATS =====");
      const token = localStorage.getItem("adminToken");
      console.log("Token:", token);
      const res = await getAdminStats();
      console.log("Stats response:", res.data);
      setStats(res.data);
    } catch (err) {
      console.error("Fetch stats error:", err.response || err);
      navigate("/admin/login");
    }
  }, [navigate]);

  const fetchTrips = useCallback(async () => {
    try {
      console.log("===== FETCH TRIPS =====");
      const res = await getTrips();
      console.log("Trips response:", res.data);
      setTrips(res.data.trips || res.data);
    } catch (err) {
      console.error("Fetch trips error:", err.response || err);
      navigate("/admin/login");
    }
  }, [navigate]);

  const fetchBookings = useCallback(async () => {
    try {
      console.log("===== FETCH BOOKINGS =====");
      const res = await getAllBookings();
      console.log("Bookings response:", res.data);
      setBookings(res.data.bookings || res.data);
    } catch (err) {
      console.error("Fetch bookings error:", err.response || err);
      navigate("/admin/login");
    }
  }, [navigate]);

  /* ===============================
     INITIAL LOAD
  =============================== */

  useEffect(() => {
    console.log("===== DASHBOARD INITIAL LOAD =====");
    Promise.all([fetchStats(), fetchTrips(), fetchBookings()])
      .catch((err) => console.error("Promise.all error:", err))
      .finally(() => setLoading(false));
  }, [fetchStats, fetchTrips, fetchBookings]);

  /* ===============================
     TRIP EDITING
  =============================== */

  const handleTripChange = (id, field, value) => {
    setTrips((prev) =>
      prev.map((trip) => (trip._id === id ? { ...trip, [field]: value } : trip))
    );
  };

  const updateTrip = async (trip) => {
    try {
      console.log("Updating trip:", trip);
      await updateTripById(trip._id, { price: trip.price, time: trip.time });
      alert("Route updated successfully");
      fetchTrips();
    } catch (err) {
      console.error("Update trip error:", err.response || err);
    }
  };

  const deleteTrip = async (id) => {
    if (!window.confirm("Delete this route?")) return;

    try {
      console.log("Deleting trip id:", id);
      await deleteTripById(id);
      fetchTrips();
    } catch (err) {
      console.error("Delete trip error:", err.response || err);
    }
  };

  /* ===============================
     BOOKING ACTIONS
  =============================== */

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      console.log("Cancelling booking id:", id);
      await cancelBooking(id);
      alert("Booking cancelled");
      fetchBookings();
    } catch (err) {
      console.error("Cancel booking error:", err.response || err);
    }
  };

  /* ===============================
     LOGOUT
  =============================== */

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  /* ===============================
     HELPERS
  =============================== */

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  const displaySeats = (seats) => {
    if (!seats) return "—";
    if (Array.isArray(seats)) return seats.join(", ");
    return seats;
  };

  /* ===============================
     LOADING
  =============================== */

  if (loading || !stats) {
    console.log("Dashboard loading...", { loading, stats });
    return <p style={{ textAlign: "center" }}>Loading admin dashboard...</p>;
  }

  /* ===============================
     UI
  =============================== */

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {/* ================= STATS ================= */}
      <h2>Statistics</h2>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <StatCard title="Trips" value={stats.totalTrips} />
        <StatCard title="Buses" value={stats.totalBuses} />
        <StatCard title="Bookings" value={stats.totalBookings} />
        <StatCard title="Revenue" value={`${stats.totalRevenue} RWF`} />
      </div>

      <hr />

      {/* ================= TRIPS ================= */}
      <h2>Routes Management</h2>
      <div style={{ overflowX: "auto" }}>
        <table border="1" width="100%" cellPadding="10">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {trips.map((trip) => (
              <tr key={trip._id}>
                <td>{trip.from}</td>
                <td>{trip.to}</td>
                <td>{formatDate(trip.date)}</td>
                <td>
                  <input
                    type="time"
                    value={trip.time}
                    onChange={(e) => handleTripChange(trip._id, "time", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={trip.price}
                    onChange={(e) => handleTripChange(trip._id, "price", e.target.value)}
                  />
                </td>
                <td>
                  <button onClick={() => updateTrip(trip)}>Update</button>
                  <button onClick={() => deleteTrip(trip._id)} style={{ marginLeft: 10, color: "red" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr />

      {/* ================= BOOKINGS ================= */}
      <h2>Booking Management</h2>
      <div style={{ overflowX: "auto" }}>
        <table border="1" width="100%" cellPadding="10">
          <thead>
            <tr>
              <th>Passenger</th>
              <th>Phone</th>
              <th>Route</th>
              <th>Date</th>
              <th>Seats</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="7" align="center">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.fullName}</td>
                  <td>{b.phone}</td>
                  <td>{b.trip ? `${b.trip.from} → ${b.trip.to}` : "N/A"}</td>
                  <td>{formatDate(b.trip?.date)}</td>
                  <td>{displaySeats(b.seats)}</td>
                  <td>{b.status}</td>
                  <td>
                    {b.status !== "CANCELLED" && (
                      <button onClick={() => handleCancelBooking(b._id)} style={{ color: "red" }}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= LOGOUT ================= */}
      <button onClick={logout} style={{ marginTop: 30 }}>
        Logout
      </button>
    </div>
  );
};

/* ===============================
   SMALL COMPONENTS
=============================== */

const StatCard = ({ title, value }) => (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: 10,
      padding: 20,
      minWidth: 180,
      background: "#f8f9fa",
    }}
  >
    <h3>{title}</h3>
    <p style={{ fontSize: 22, fontWeight: "bold" }}>{value}</p>
  </div>
);

export default Dashboard;
