import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "../../styles/CompanyDashboard.css";

const CompanyDashboard = () => {

  const navigate = useNavigate();

  // safely read company from localStorage
  const company = JSON.parse(localStorage.getItem("company") || "null");

  const handleLogout = () => {
    localStorage.removeItem("company");
    localStorage.removeItem("companyToken");
    navigate("/company/login");
  };

  return (
    <div className="company-dashboard">

      <aside className="sidebar">

        <h2 className="logo">QB Operator</h2>

        <nav>

          <NavLink to="overview">Overview</NavLink>

          <NavLink to="trips">Trips</NavLink>

          <NavLink to="trips/create">Create Trip</NavLink>

          <NavLink to="buses">Buses</NavLink>

          <NavLink to="bookings">Bookings</NavLink>

          {!company && (
            <NavLink to="/company/login">Login</NavLink>
          )}

          {company && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}

        </nav>

      </aside>

      <main className="dashboard-content">
        <Outlet />
      </main>

    </div>
  );
};

export default CompanyDashboard;