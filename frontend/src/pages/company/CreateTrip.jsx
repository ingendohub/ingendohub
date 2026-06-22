import { useState, useEffect } from "react";
import companyService from "../../api/company/companyApi";

const CreateTrip = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [trip, setTrip] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    price: "",
    bus: ""
  });

  /* ================= FETCH BUSES ================= */
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const data = await companyService.getBuses();

        console.log("Buses loaded:", data);

        setBuses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load buses:", error);
        setBuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setTrip({
      ...trip,
      [e.target.name]: e.target.value
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!trip.bus) {
      alert("Please select a bus");
      return;
    }

    try {
      setSubmitting(true);

      // API call to create trip
      const createdTrip = await companyService.createTrip(trip);

      console.log("Trip created:", createdTrip);

      alert("Trip created successfully ✔");

      // Reset form
      setTrip({
        from: "",
        to: "",
        date: "",
        time: "",
        price: "",
        bus: ""
      });
    } catch (error) {
      console.error("Failed to create trip:", error);
      alert(
        error.response?.data?.message ||
        error.message ||
        "Failed to create trip"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Trip</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="from"
          placeholder="From"
          value={trip.from}
          onChange={handleChange}
          required
        />

        <input
          name="to"
          placeholder="To"
          value={trip.to}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="date"
          value={trip.date}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          name="time"
          value={trip.time}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={trip.price}
          onChange={handleChange}
          required
        />

        {/* ================= BUS SELECT ================= */}
        <select
          name="bus"
          value={trip.bus}
          onChange={handleChange}
          required
          disabled={loading || buses.length === 0}
        >
          <option value="">
            {loading
              ? "Loading buses..."
              : buses.length === 0
              ? "No buses available"
              : "Select Bus"}
          </option>

          {buses.map((bus) => (
            <option key={bus._id} value={bus._id}>
              {bus.plateNumber || bus.name || "Bus"} — {bus.seats} seats
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading || buses.length === 0 || submitting}
        >
          {submitting ? "Creating..." : "Create Trip"}
        </button>
      </form>
    </div>
  );
};

/* ================= STYLES ================= */
const styles = {
  container: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fafafa"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  }
};

export default CreateTrip;

