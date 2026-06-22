import { useEffect, useState } from "react";
import axios from "axios";

const DashboardHome = () => {

  const [stats, setStats] = useState(null);

  useEffect(() => {

    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/company/dashboard/stats");
        setStats(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();

  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="dashboard-stats">

      <div className="card">
        <h3>Buses</h3>
        <p>{stats.totalBuses}</p>
      </div>

      <div className="card">
        <h3>Trips</h3>
        <p>{stats.totalTrips}</p>
      </div>

      <div className="card">
        <h3>Bookings</h3>
        <p>{stats.totalBookings}</p>
      </div>

      <div className="card">
        <h3>Revenue</h3>
        <p>{stats.totalRevenue} RWF</p>
      </div>

    </div>
  );
};

export default DashboardHome;