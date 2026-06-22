import { useEffect, useState } from "react";
import companyApi from "../../api/company/companyApi";

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: form state
  const [form, setForm] = useState({
    model: "",
    plateNumber: "",
    seats: ""
  });

  const [creating, setCreating] = useState(false);

  /* =========================================
     FETCH BUSES
  ========================================= */
  const fetchBuses = async () => {
    try {
      const data = await companyApi.getBuses();
      setBuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch buses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  /* =========================================
     HANDLE INPUT CHANGE
  ========================================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* =========================================
     CREATE BUS
  ========================================= */
  const handleCreateBus = async (e) => {
    e.preventDefault();

    if (!form.model || !form.plateNumber || !form.seats) {
      return alert("All fields are required");
    }

    try {
      setCreating(true);

      await companyApi.createBus({
        ...form,
        seats: Number(form.seats)
      });

      alert("Bus created successfully");

      // reset form
      setForm({
        model: "",
        plateNumber: "",
        seats: ""
      });

      fetchBuses(); // refresh list
    } catch (error) {
      console.error("Create bus error:", error);
      alert(error.response?.data?.message || "Failed to create bus");
    } finally {
      setCreating(false);
    }
  };

  /* =========================================
     DELETE BUS
  ========================================= */
  const handleDeleteBus = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;

    try {
      await companyApi.deleteBus(id);

      alert("Bus deleted successfully");

      fetchBuses(); // refresh
    } catch (error) {
      console.error("Delete bus error:", error);
      alert(error.response?.data?.message || "Failed to delete bus");
    }
  };

  if (loading) return <p>Loading buses...</p>;

  return (
    <div>
      <h2>Buses</h2>

      {/* ================= CREATE BUS FORM ================= */}
      <form onSubmit={handleCreateBus} style={styles.form}>
        <input
          type="text"
          name="model"
          placeholder="Bus Model"
          value={form.model}
          onChange={handleChange}
        />
        <input
          type="text"
          name="plateNumber"
          placeholder="Plate Number"
          value={form.plateNumber}
          onChange={handleChange}
        />
        <input
          type="number"
          name="seats"
          placeholder="Seats"
          value={form.seats}
          onChange={handleChange}
        />

        <button type="submit" disabled={creating}>
          {creating ? "Adding..." : "Add Bus"}
        </button>
      </form>

      {/* ================= BUS LIST ================= */}
      {buses.length === 0 ? (
        <p>No buses available.</p>
      ) : (
        <div className="bus-list">
          {buses.map((bus) => (
            <div key={bus._id} style={styles.card}>
              <p><strong>Plate:</strong> {bus.plateNumber}</p>
              <p><strong>Model:</strong> {bus.model}</p>
              <p><strong>Seats:</strong> {bus.seats}</p>

              {/* DELETE BUTTON */}
              <button
                onClick={() => handleDeleteBus(bus._id)}
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

export default Buses;