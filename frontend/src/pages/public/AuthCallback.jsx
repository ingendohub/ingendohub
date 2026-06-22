import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * AuthCallback — handles the redirect from Google OAuth.
 * URL: /auth/callback?token=<jwt>&user=<encoded-json>
 *
 * Saves token + user object to localStorage, then redirects to home.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing your login…");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const userRaw = params.get("user");
      const authError = params.get("auth");

      if (authError === "error") {
        setStatus("Google sign-in failed. Redirecting…");
        setTimeout(() => navigate("/", { replace: true }), 2000);
        return;
      }

      if (!token || !userRaw) {
        setStatus("Invalid callback. Redirecting…");
        setTimeout(() => navigate("/", { replace: true }), 2000);
        return;
      }

      const user = JSON.parse(decodeURIComponent(userRaw));

      // Persist auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Notify any listening components (e.g. header)
      window.dispatchEvent(new Event("userUpdated"));

      setStatus("Signed in successfully! Redirecting…");
      setTimeout(() => navigate("/", { replace: true }), 800);
    } catch (err) {
      console.error("OAuth callback error:", err);
      setStatus("Something went wrong. Redirecting…");
      setTimeout(() => navigate("/", { replace: true }), 2000);
    }
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background: "var(--bg, #f4f7ee)",
        color: "var(--text, #1a2010)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 48,
          height: 48,
          border: "4px solid var(--border, #d4e0b8)",
          borderTopColor: "var(--primary, #6ea00a)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontWeight: 600, fontSize: 16 }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AuthCallback;
