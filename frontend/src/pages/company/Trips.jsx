import { useEffect, useState } from "react";
import companyApi from "../../api/company/companyApi";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    bus: "",
    from: "",
    to: "",
    date: "",
    time: "",
    price: ""
  });

  /* =========================================
     FETCH DATA
  ========================================= */
  const fetchData = async () => {
    try {
      const tripsData = await companyApi.getTrips();
      const busesData = await companyApi.getBuses();

      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setBuses(Array.isArray(busesData) ? busesData : []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =========================================
     HANDLE INPUT
  ========================================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* =========================================
     CREATE TRIP
  ========================================= */
  const handleCreateTrip = async (e) => {
    e.preventDefault();

    const { bus, from, to, date, time, price } = form;

    if (!bus || !from || !to || !date || !time || !price) {
      return alert("All fields are required");
    }

    try {
      setCreating(true);

      await companyApi.createTrip({
        ...form,
        price: Number(price)
      });

      alert("Trip created successfully");

      setForm({
        bus: "",
        from: "",
        to: "",
        date: "",
        time: "",
        price: ""
      });

      fetchData(); // refresh
    } catch (error) {
      console.error("Create trip error:", error);
      alert(error.response?.data?.message || "Failed to create trip");
    } finally {
      setCreating(false);
    }
  };

  /* =========================================
     DELETE TRIP
  ========================================= */
  const handleDeleteTrip = async (id) => {
    if (!window.confirm("Delete this trip?")) return;

    try {
      await companyApi.deleteTrip(id);
      alert("Trip deleted");
      fetchData();
    } catch (error) {
      console.error("Delete trip error:", error);
      alert(error.response?.data?.message || "Failed to delete trip");
    }
  };

  if (loading) return <p>Loading trips...</p>;

  return (
    <div>
      <h2>Trips</h2>

      {/* ================= CREATE TRIP ================= */}
      <form onSubmit={handleCreateTrip} style={styles.form}>
        {/* BUS DROPDOWN */}
        <select name="bus" value={form.bus} onChange={handleChange}>
          <option value="">Select Bus</option>
          {buses.map((bus) => (
            <option key={bus._id} value={bus._id}>
              {bus.plateNumber} ({bus.model})
            </option>
          ))}
        </select>

        <input
          name="from"
          placeholder="From"
          value={form.from}
          onChange={handleChange}
        />
        <input
          name="to"
          placeholder="To"
          value={form.to}
          onChange={handleChange}
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Trip"}
        </button>
      </form>

      {/* ================= TRIP LIST ================= */}
      {trips.length === 0 ? (
        <p>No trips available.</p>
      ) : (
        <div>
          {trips.map((trip) => (
            <div key={trip._id} style={styles.card}>
              <p><strong>Route:</strong> {trip.from} → {trip.to}</p>
              <p><strong>Date:</strong> {trip.date}</p>
              <p><strong>Time:</strong> {trip.time}</p>
              <p><strong>Price:</strong> {trip.price} RWF</p>
              <p><strong>Bus:</strong> {trip.bus?.plateNumber}</p>
              <p><strong>Seats:</strong> {trip.availableSeats}</p>

              <button
                onClick={() => handleDeleteTrip(trip._id)}
                style={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================= STYLES ================= */
const styles = {
  form: {
    marginBottom: "20px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "10px",
    backgroundColor: "#f9f9f9"
  },
  deleteBtn: {
    marginTop: "10px",
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    cursor: "pointer",
    borderRadius: "4px"
  }
};

export default Trips;