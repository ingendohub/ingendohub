import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiArrowLeft, FiShield } from "react-icons/fi";
import axiosPublic from "../../api/public/axiosPublic";
import { useLang } from "../../i18n/LanguageContext";
import logo from "../../assets/logo.svg";

const PasswordStrength = ({ password }) => {
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#e2e8f0", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background: i <= strength ? colors[strength] : "#e2e8f0",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: "12px", color: colors[strength], fontWeight: 600 }}>
        {labels[strength]} password
      </span>
    </div>
  );
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      return setError("All fields are required.");
    }

    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      await axiosPublic.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. The link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a2a66 0%, #1976d2 50%, #2196f3 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
    }}>
      {/* Background decoration */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0,
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            width: `${120 + i * 80}px`,
            height: `${120 + i * 80}px`,
            top: `${10 + i * 13}%`,
            left: `${-5 + i * 18}%`,
          }} />
        ))}
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "440px",
      }}>

        {/* Card */}
        <div style={{
          background: "#fff",
          borderRadius: "24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}>
          {/* Card Header */}
          <div style={{
            background: "linear-gradient(135deg, #0a2a66, #1976d2)",
            padding: "32px 36px 28px",
            textAlign: "center",
          }}>
            {/* Logo */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "12px", marginBottom: "20px"
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "12px",
                overflow: "hidden", border: "2px solid rgba(255,255,255,0.3)",
                background: "#000", flexShrink: 0
              }}>
                <img src={logo} alt="Ingendohub" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "20px", letterSpacing: "1px" }}>
                INGENDOHUB
              </span>
            </div>

            {/* Icon */}
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <FiShield size={28} color="#fff" />
            </div>

            <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "22px", margin: "0 0 6px" }}>
              {success ? "Password Reset!" : "Create New Password"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", margin: 0 }}>
              {success
                ? "Your password has been updated successfully."
                : "Enter a strong new password for your account."}
            </p>
          </div>

          {/* Card Body */}
          <div style={{ padding: "32px 36px" }}>

            {/* SUCCESS STATE */}
            {success && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981, #34d399)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)",
                }}>
                  <FiCheckCircle size={36} color="#fff" />
                </div>
                <h2 style={{ color: "#0f172a", fontWeight: 800, fontSize: "20px", marginBottom: "12px" }}>
                  All Done! 🎉
                </h2>
                <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.6, marginBottom: "28px" }}>
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <button
                  onClick={() => navigate("/")}
                  style={{
                    width: "100%", padding: "14px",
                    background: "linear-gradient(135deg, #1976d2, #1565c0)",
                    color: "#fff", fontWeight: 700, fontSize: "15px",
                    border: "none", borderRadius: "12px", cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(25, 118, 210, 0.35)",
                    transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "none"}
                >
                  Go to Home & Sign In
                </button>
              </div>
            )}

            {/* FORM STATE */}
            {!success && (
              <>
                {/* Error */}
                {error && (
                  <div style={{
                    display: "flex", gap: "10px", alignItems: "flex-start",
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: "10px", padding: "12px 14px", marginBottom: "20px",
                    color: "#ef4444", fontSize: "14px", lineHeight: 1.5,
                  }}>
                    <FiAlertCircle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* New Password Field */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      display: "block", marginBottom: "8px",
                      fontWeight: 700, fontSize: "13px", color: "#374151",
                    }}>
                      New Password
                    </label>
                    <div style={{
                      display: "flex", alignItems: "center",
                      border: `2px solid ${error && !password ? "#ef4444" : "#e5e7eb"}`,
                      borderRadius: "12px",
                      background: "#f9fafb",
                      transition: "border-color 0.2s",
                      overflow: "hidden",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#1976d2"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                    >
                      <div style={{ padding: "0 12px", color: "#9ca3af" }}>
                        <FiLock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder="Minimum 8 characters"
                        required
                        style={{
                          flex: 1, border: "none", outline: "none",
                          background: "transparent", padding: "13px 4px",
                          fontSize: "15px", color: "#111827",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: "0 12px", color: "#6b7280",
                          display: "flex", alignItems: "center",
                        }}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                  </div>

                  {/* Confirm Password Field */}
                  <div style={{ marginBottom: "28px" }}>
                    <label style={{
                      display: "block", marginBottom: "8px",
                      fontWeight: 700, fontSize: "13px", color: "#374151",
                    }}>
                      Confirm New Password
                    </label>
                    <div style={{
                      display: "flex", alignItems: "center",
                      border: `2px solid ${confirmPassword && confirmPassword !== password ? "#ef4444" : "#e5e7eb"}`,
                      borderRadius: "12px",
                      background: "#f9fafb",
                      transition: "border-color 0.2s",
                      overflow: "hidden",
                    }}>
                      <div style={{ padding: "0 12px", color: "#9ca3af" }}>
                        <FiLock size={18} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                        placeholder="Re-enter your new password"
                        required
                        style={{
                          flex: 1, border: "none", outline: "none",
                          background: "transparent", padding: "13px 4px",
                          fontSize: "15px", color: "#111827",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: "0 12px", color: "#6b7280",
                          display: "flex", alignItems: "center",
                        }}
                      >
                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>
                        Passwords do not match
                      </p>
                    )}
                    {confirmPassword && confirmPassword === password && (
                      <p style={{ color: "#10b981", fontSize: "12px", marginTop: "6px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                        <FiCheckCircle size={13} /> Passwords match
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%", padding: "15px",
                      background: loading
                        ? "#93c5fd"
                        : "linear-gradient(135deg, #1976d2, #1565c0)",
                      color: "#fff", fontWeight: 700, fontSize: "16px",
                      border: "none", borderRadius: "12px",
                      cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 16px rgba(25, 118, 210, 0.35)",
                      transition: "all 0.2s ease",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                      letterSpacing: "0.3px",
                    }}
                    onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "none"; }}
                  >
                    {loading ? (
                      <>
                        <span style={{
                          width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)",
                          borderTopColor: "#fff", borderRadius: "50%",
                          animation: "spin 0.7s linear infinite", display: "inline-block",
                        }} />
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <FiShield size={18} />
                        Reset My Password
                      </>
                    )}
                  </button>
                </form>

                {/* Back to home */}
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                  <Link
                    to="/"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      color: "#64748b", fontSize: "14px", fontWeight: 600,
                      textDecoration: "none", transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = "#1976d2"}
                    onMouseOut={(e) => e.currentTarget.style.color = "#64748b"}
                  >
                    <FiArrowLeft size={16} />
                    Back to Home
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Card Footer */}
          <div style={{
            background: "#f8fafc", borderTop: "1px solid #f1f5f9",
            padding: "16px 36px", textAlign: "center",
          }}>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
              🔒 This link is valid for 1 hour for security purposes.
            </p>
          </div>
        </div>

        {/* Bottom link */}
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.7)", marginTop: "20px", fontSize: "13px" }}>
          Need help?{" "}
          <Link to="/contact" style={{ color: "#fff", fontWeight: 700, textDecoration: "underline" }}>
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
