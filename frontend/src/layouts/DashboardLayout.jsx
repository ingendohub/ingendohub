import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiCreditCard, FiSettings, FiStar, FiUser, FiLogOut, FiPackage } from "react-icons/fi";
import "../styles/dashboard.css";
import { useLang } from "../i18n/LanguageContext";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    navigate("/"); // Redirect safely if state is lost
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="user-dashboard-no-sidebar">
      {/* ===== MAIN CONTENT AREA ===== */}
      <main className="dashboard-main-full">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

export default DashboardLayout;