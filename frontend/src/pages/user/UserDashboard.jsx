import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  /* ============================== 
     REDIRECT IF NOT LOGGED IN 
  ============================== */
  useEffect(() => {
    if (!user) navigate("/"); // redirect to homepage/login if no user
  }, [user, navigate]);

  /* ============================== 
     LOGOUT FUNCTION 
  ============================== */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // go back to homepage/login
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ===== SIDEBAR ===== */}
      <aside
        style={{
          width: 260,
          background: "#1e293b",
          color: "#fff",
          padding: 25,
        }}
      >
        <h2 style={{ marginBottom: 30 }}>Xpresi</h2>
        <nav style={{ lineHeight: 2.4 }}>
          <p
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </p>
          <p
            style={{ cursor: "pointer" }}
            onClick={() => navigate("my-trips")}
          >
            My Trips
          </p>
          <p
            style={{ cursor: "pointer" }}
            onClick={() => navigate("profile")}
          >
            Profile
          </p>
          <p
            style={{ cursor: "pointer", marginTop: 30, color: "#f87171" }}
            onClick={handleLogout}
          >
            Logout
          </p>
        </nav>
      </aside>

      {/* ===== MAIN CONTENT (NESTED ROUTES RENDER HERE) ===== */}
      <main
        style={{
          flex: 1,
          padding: 30,
          background: "#f8fafc",
        }}
      >
        <h1 style={{ marginBottom: 20 }}>
          Welcome, {user?.fullName || "Passenger"}
        </h1>
        {/* Nested routes like Profile / MyTrips will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default UserDashboard;