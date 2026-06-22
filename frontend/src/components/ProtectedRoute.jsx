import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute component
 * @param {ReactNode} children - The protected component(s) to render
 * @param {string} type - "user" or "company" to determine which login to check
 */
const ProtectedRoute = ({ children, type = "user" }) => {
  let user = null, company = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}
  try { company = JSON.parse(localStorage.getItem("company")); } catch {}

  // Check login based on type
  if (type === "user" && (!user || (!user.token && !localStorage.getItem("token")))) {
    return <Navigate to="/" replace />;
  }

  if (type === "company" && (!company || !localStorage.getItem("companyToken"))) {
    return <Navigate to="/company/login" replace />;
  }

  // Logged in, render children
  return children;
};

export default ProtectedRoute;