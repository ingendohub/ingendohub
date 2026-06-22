import { useOutletContext } from "react-router-dom";
import { FiCreditCard, FiPackage, FiStar } from "react-icons/fi";

const DashboardHome = () => {
  const { user } = useOutletContext();

  return (
    <>
      <div className="dashboard-header">
        <h1>Welcome back, {user?.fullName ? user.fullName.split(" ")[0] : "Passenger"}!</h1>
        <p>Manage your tickets, view payment history, and update your account details.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><FiPackage /></div>
          <div className="stat-info">
            <h4>Total Bookings</h4>
            <p>—</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><FiCreditCard /></div>
          <div className="stat-info">
            <h4>Total Spend</h4>
            <p>— RWF</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple"><FiStar /></div>
          <div className="stat-info">
            <h4>Reviews Given</h4>
            <p>—</p>
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ maxWidth: "100%" }}>
        <h3 style={{ marginTop: 0, marginBottom: 20, color: "var(--heading)", fontSize: 17 }}>Recent Activity</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{
            padding: 16,
            background: "var(--surface-alt)",
            borderRadius: 10,
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "var(--primary-soft)",
              color: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>
              <FiPackage />
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 600, color: "var(--heading)" }}>No recent activity yet</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Your booking activity will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;
