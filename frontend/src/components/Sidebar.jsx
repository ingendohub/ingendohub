import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar, user, handleLogout }) => {
  const navigate = useNavigate();

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <h2>Xpresi</h2>
      <nav>
        <p onClick={() => navigate("/dashboard")}>Home</p>
        <p onClick={() => navigate("/dashboard/my-trips")}>My Trips</p>
        <p onClick={() => navigate("/dashboard/profile")}>Profile</p>
        <p style={{ marginTop: 30, color: "#f87171" }} onClick={handleLogout}>
          Logout
        </p>
      </nav>
    </aside>
  );
};

export default Sidebar;