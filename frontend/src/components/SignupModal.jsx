import { useState, useEffect } from "react";
import {
  FiX, FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff,
  FiAlertCircle, FiArrowLeft, FiCheckCircle
} from "react-icons/fi";
import axios from "axios";
import { useLang } from "../i18n/LanguageContext";
import "../styles/auth-modal.css";

const SignupModal = ({ isOpen, onClose, onSwitchLogin }) => {
  const { t } = useLang();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccess(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setTermsAccepted(false);
      setPasswordStrength(0);
    }
  }, [isOpen]);

  // Escape closes
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const calcStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    setPasswordStrength(calcStrength(val));
    setError("");
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "#e53e3e", "#f6ad55", "#68d391", "#38a169"][passwordStrength];

  const validate = () => {
    if (!fullName.trim()) { setError(t("signup_fullname") + " is required"); return false; }
    if (!phone.trim() || !/^\+?[\d\s\-]{7,15}$/.test(phone)) { setError(t("signup_error_phone")); return false; }
    if (!email.trim()) { setError(t("login_error_empty")); return false; }
    if (password.length < 8) { setError(t("signup_error_weak")); return false; }
    if (password !== confirmPassword) { setError(t("signup_error_match")); return false; }
    if (!termsAccepted) { setError(t("signup_error_terms")); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:3001/api"}/auth/register`,
        { fullName, phone, email, password }
      );
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || t("signup_error_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:3001/api"}/auth/google`;
  };

  if (!isOpen) return null;

  // ---- Success screen ----
  if (success) {
    return (
      <div className="auth-overlay auth-overlay--visible" onClick={(e) => e.stopPropagation()}>
        <div className="auth-sheet auth-sheet--visible auth-sheet--signup" onClick={(e) => e.stopPropagation()}>
          <div className="auth-success-screen">
            <div className="auth-success-icon"><FiCheckCircle size={52} /></div>
            <h2>{t("signup_success")}</h2>
            <button
              className="auth-submit"
              onClick={() => { onClose(); onSwitchLogin(); }}
            >
              {t("nav_signin")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    // Signup overlay does NOT close on backdrop click (only back button / escape)
    <div className="auth-overlay auth-overlay--visible" onClick={(e) => e.stopPropagation()}>
      <div
        className="auth-sheet auth-sheet--visible auth-sheet--signup"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("signup_title")}
      >
        {/* Back button (instead of X — user must click back interface to cancel) */}
        <button
          className="auth-back"
          onClick={onClose}
          aria-label="Go back"
          title="Close"
        >
          <FiArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-wrap auth-icon-wrap--signup">
            <FiUser size={22} />
          </div>
          <h2 className="auth-title">{t("signup_title")}</h2>
          <p className="auth-subtitle">{t("signup_subtitle")}</p>
        </div>

        {/* Google button */}
        <button className="btn-google" type="button" onClick={handleGoogleSignup}>
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t("signup_google")}
        </button>

        {/* Divider */}
        <div className="auth-divider"><span>{t("signup_or")}</span></div>

        {/* Error */}
        {error && (
          <div className="auth-error" role="alert">
            <FiAlertCircle /><span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name */}
          <div className="auth-field">
            <label htmlFor="signup-fullname">{t("signup_fullname")}</label>
            <div className="auth-input-wrap">
              <FiUser className="auth-input-icon" />
              <input
                id="signup-fullname"
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(""); }}
                placeholder={t("signup_fullname_placeholder")}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="auth-field">
            <label htmlFor="signup-phone">{t("signup_phone")}</label>
            <div className="auth-input-wrap">
              <FiPhone className="auth-input-icon" />
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                placeholder={t("signup_phone_placeholder")}
                autoComplete="tel"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="signup-email">{t("signup_email")}</label>
            <div className="auth-input-wrap">
              <FiMail className="auth-input-icon" />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder={t("signup_email_placeholder")}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="signup-password">{t("signup_password")}</label>
            <div className="auth-input-wrap">
              <FiLock className="auth-input-icon" />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder={t("signup_password_placeholder")}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
              </button>
            </div>
            {/* Password strength bar */}
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  {[1,2,3,4].map(n => (
                    <div
                      key={n}
                      className="strength-segment"
                      style={{ background: n <= passwordStrength ? strengthColor : "#e2e8f0" }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label htmlFor="signup-confirm">{t("signup_confirm_password")}</label>
            <div className="auth-input-wrap">
              <FiLock className="auth-input-icon" />
              <input
                id="signup-confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder={t("signup_confirm_placeholder")}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FiEyeOff size={17} /> : <FiEye size={17} />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="auth-terms">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => { setTermsAccepted(e.target.checked); setError(""); }}
            />
            <span>
              {t("signup_terms")}{" "}
              <a href="/terms" target="_blank" rel="noreferrer">{t("signup_terms_link")}</a>
              {" "}{t("signup_and")}{" "}
              <a href="/privacy" target="_blank" rel="noreferrer">{t("signup_privacy")}</a>
            </span>
          </label>

          <button
            id="signup-submit-btn"
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? t("signup_loading") : t("signup_btn")}
          </button>
        </form>

        {/* Switch to login */}
        <p className="auth-switch">
          {t("signup_already")}{" "}
          <button type="button" onClick={() => { onClose(); onSwitchLogin(); }}>
            {t("signup_switch_login")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupModal;
