import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import axiosPublic from "../api/public/axiosPublic";
import { useLang } from "../i18n/LanguageContext";
import "../styles/auth-modal.css";

const LoginModal = ({ isOpen, onClose, onSwitchSignup }) => {
  const navigate = useNavigate();
  const { t } = useLang();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setError("");
      setSuccess("");
      setEmail("");
      setPassword("");
      setIsForgotPassword(false);
    }
  }, [isOpen]);

  // Escape key closes
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen && !mounted) return null;

  const validateForm = () => {
    if (!email || !password) { setError(t("login_error_empty")); return false; }
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { data } = await axiosPublic.post("/auth/login", { email, password });
      
      if (data.token) localStorage.setItem("token", data.token);
      else localStorage.setItem("token", "user_token"); // fallback just in case
      localStorage.setItem("user", JSON.stringify(data.user || data));
      
      onClose();
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || t("login_error_invalid"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) return setError(t("login_email_placeholder") || "Email is required");

    try {
      setLoading(true);
      const { data } = await axiosPublic.post("/auth/forgot-password", { email });
      setSuccess(data.message || "Password reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth — update URL to your backend's Google auth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:3001/api"}/auth/google`;
  };

  return (
    <div
      className={`auth-overlay ${isOpen ? "auth-overlay--visible" : ""}`}
      onClick={onClose}
    >
      <div
        className={`auth-sheet ${isOpen ? "auth-sheet--visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("login_title")}
      >
        {/* Close button */}
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <FiX size={20} />
        </button>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <FiLock size={22} />
          </div>
          <h2 className="auth-title">{isForgotPassword ? "Forgot Password" : t("login_title")}</h2>
          <p className="auth-subtitle">{isForgotPassword ? "Enter your email to receive a reset link" : t("login_subtitle")}</p>
        </div>

        {!isForgotPassword && (
          <>
            {/* Google button */}
            <button className="btn-google" type="button" onClick={handleGoogleLogin}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("login_google")}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>{t("login_or")}</span>
            </div>
          </>
        )}

        {/* Error / Success messages */}
        {error && (
          <div className="auth-error" role="alert">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="auth-error" role="alert" style={{ background: "#dcfce7", color: "green" }}>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isForgotPassword ? handleForgotSubmit : handleLoginSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="login-email">{t("login_email")}</label>
            <div className="auth-input-wrap">
              <FiMail className="auth-input-icon" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(""); }}
                placeholder={t("login_email_placeholder")}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">{t("login_password")}</label>
                <button type="button" className="auth-forgot" onClick={() => { setIsForgotPassword(true); setError(""); setSuccess(""); }}>
                  {t("login_forgot")}
                </button>
              </div>
              <div className="auth-input-wrap">
                <FiLock className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder={t("login_password_placeholder")}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t("login_hide_password") : t("login_show_password")}
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : null}
            {loading ? (isForgotPassword ? "Sending..." : t("login_loading")) : (isForgotPassword ? "Send Reset Link" : t("login_btn"))}
          </button>
        </form>

        {isForgotPassword ? (
          <p className="auth-switch">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => { setIsForgotPassword(false); setError(""); setSuccess(""); }}
            >
              Back to Login
            </button>
          </p>
        ) : (
          <p className="auth-switch">
            {t("login_no_account")}{" "}
            <button
              type="button"
              onClick={() => { onClose(); onSwitchSignup(); }}
            >
              {t("login_switch_signup")}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
