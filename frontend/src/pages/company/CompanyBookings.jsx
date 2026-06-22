import { useEffect, useState } from "react";
import companyService from "../../api/company/companyApi";

const CompanyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await companyService.getBookings();

        console.log("Bookings loaded:", data);

        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (!bookings.length) return <p>No bookings yet.</p>;

  return (
    <div>
      <h2>Company Bookings</h2>

      <div className="bookings-list">
        {bookings.map((booking) => {
          const trip = booking.trip || {};
          const bus = trip.bus || {};

          /* ✅ SAFE PASSENGER NAME */
          const passengerName =
            booking.fullName ||
            booking.user?.fullName ||
            booking.passengerName ||
            "N/A";

          /* ✅ SAFE SEATS HANDLING */
          const seatsDisplay = Array.isArray(booking.seats)
            ? booking.seats.join(", ")
            : booking.seats !== undefined && booking.seats !== null
            ? booking.seats.toString()
            : "N/A";

          /* ✅ COMPANY NAME (VOLCANO EXPRESS etc.) */
          const companyName =
            trip.tripName || // you already set this as company name
            trip.company?.name ||
            "Unknown Company";

          return (
            <div key={booking._id} style={styles.card}>
              <p><strong>Passenger:</strong> {passengerName}</p>

              <p><strong>Company:</strong> {companyName}</p>

              <p><strong>Seats:</strong> {seatsDisplay}</p>

              <p>
                <strong>Total Price:</strong>{" "}
                {(booking.totalPrice || 0).toLocaleString()} RWF
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {booking.paymentStatus || booking.status || "Pending"}
              </p>

              {/* ✅ TRIP INFO */}
              {trip && (
                <>
                  <p>
                    <strong>Route:</strong>{" "}
                    {trip.from || "N/A"} → {trip.to || "N/A"}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {trip.date
                      ? new Date(trip.date).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {trip.time || "N/A"}
                  </p>

                  <p>
                    <strong>Bus Plate:</strong>{" "}
                    {bus.plateNumber || "N/A"}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "10px",
    backgroundColor: "#f9f9f9"
  }
};

export default CompanyBookings;