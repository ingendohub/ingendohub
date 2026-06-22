import { useEffect, useState } from "react";
import companyApi from "../../api/company/companyApi"; // companyService

const Overview = () => {
  const [stats, setStats] = useState({
    buses: 0,
    trips: 0,
    bookings: 0,
    revenue: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Fetching dashboard statistics...");

        // ✅ Use service methods instead of axios.get directly
        const [busesData, tripsData, bookingsData] = await Promise.all([
          companyApi.getBuses(),
          companyApi.getTrips(),
          companyApi.getBookings()
        ]);

        console.log("Buses:", busesData);
        console.log("Trips:", tripsData);
        console.log("Bookings:", bookingsData);

        // Calculate revenue
        const revenue = bookingsData.reduce(
          (total, booking) => total + (booking.totalPrice || 0),
          0
        );

        setStats({
          buses: busesData.length,
          trips: tripsData.length,
          bookings: bookingsData.length,
          revenue
        });

        console.log("Dashboard stats loaded successfully", {
          buses: busesData.length,
          trips: tripsData.length,
          bookings: bookingsData.length,
          revenue
        });

      } catch (error) {
        console.error(
          "Failed to fetch dashboard data:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>
      <h1>Company Dashboard</h1>
      <p>Welcome to the operator dashboard.</p>

      <div className="dashboard-stats">

        <div className="stat-card">
          <h3>Total Buses</h3>
          <p>{stats.buses}</p>
        </div>

        <div className="stat-card">
          <h3>Total Trips</h3>
          <p>{stats.trips}</p>
        </div>

        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>{stats.bookings}</p>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>{stats.revenue.toLocaleString()} RWF</p>
        </div>

      </div>
    </div>
  );
};

export default Overview;