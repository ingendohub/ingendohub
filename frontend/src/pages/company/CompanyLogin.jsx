import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ Added Link
import companyApi from "../../api/company/companyApi"; // companyService

const CompanyLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  /* =========================================
     REDIRECT IF ALREADY LOGGED IN
  ========================================= */
  useEffect(() => {
    const token = localStorage.getItem("companyToken");
    if (token) {
      navigate("/company");
    }
  }, [navigate]);

  /* =========================================
     HANDLE INPUT CHANGE
  ========================================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================================
     HANDLE LOGIN
  ========================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* Clear any previous session */
      localStorage.removeItem("companyToken");
      localStorage.removeItem("company");

      console.log("Sending login request with:", form);

      const res = await companyApi.login(form);
      console.log("Login response:", res.data);

      const { token, company } = res.data;

      if (!token) {
        throw new Error("Server did not return a token");
      }

      /* Save authentication info */
      localStorage.setItem("companyToken", token);
      localStorage.setItem("company", JSON.stringify(company));

      console.log("Token stored successfully ✔");

      /* Redirect to dashboard */
      navigate("/company");
    } catch (err) {
      console.error(
        "Company login error:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Company Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ display: "block", width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ display: "block", width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", borderRadius: "4px", backgroundColor: "#0d6efd", color: "#fff", border: "none", cursor: "pointer" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* ================= REGISTER LINK ================= */}
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Don't have a company account?{" "}
        <Link to="/company/register" style={{ color: "#0d6efd", fontWeight: "bold" }}>
          Register here
        </Link>
      </p>
    </div>
  );
};

export default CompanyLogin;
