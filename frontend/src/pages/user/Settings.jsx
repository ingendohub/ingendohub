import { useState } from "react";
import { FiBell, FiLock } from "react-icons/fi";

const Settings = () => {
  const [emailBooking, setEmailBooking] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [promoOffers, setPromoOffers] = useState(false);

  return (
    <>
      <div className="dashboard-header">
        <h1>Account Settings</h1>
        <p>Manage your password and notification preferences.</p>
      </div>

      {/* ===== Change Password ===== */}
      <div className="dashboard-card">
        <h3 style={{ margin: "0 0 20px", color: "var(--heading)", display: "flex", alignItems: "center", gap: 10, fontSize: 17 }}>
          <FiLock size={18} style={{ color: "var(--primary)" }} /> Change Password
        </h3>
        <form className="dashboard-form">
          <div className="form-group-dash">
            <label>Current Password</label>
            <input type="password" placeholder="Enter current password" />
          </div>
          <div className="form-group-dash">
            <label>New Password</label>
            <input type="password" placeholder="Create a new password" />
          </div>
          <div className="form-group-dash">
            <label>Confirm New Password</label>
            <input type="password" placeholder="Repeat new password" />
          </div>
          <div>
            <button type="button" className="btn-primary-dash">Update Password</button>
          </div>
        </form>
      </div>

      {/* ===== Notification Preferences ===== */}
      <div className="dashboard-card" style={{ marginTop: 24 }}>
        <h3 style={{ margin: "0 0 20px", color: "var(--heading)", display: "flex", alignItems: "center", gap: 10, fontSize: 17 }}>
          <FiBell size={18} style={{ color: "var(--primary)" }} /> Notification Preferences
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { label: "Email me for booking confirmations", state: emailBooking, setter: setEmailBooking },
            { label: "SMS alerts for bus departure delays", state: smsAlerts, setter: setSmsAlerts },
            { label: "Promotional offers and discounts",    state: promoOffers, setter: setPromoOffers },
          ].map(({ label, state, setter }) => (
            <label
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 500,
                color: "var(--text)",
                padding: "16px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span>{label}</span>
              {/* Toggle pill */}
              <button
                type="button"
                onClick={() => setter(!state)}
                style={{
                  position: "relative",
                  width: 46,
                  height: 26,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: state ? "var(--primary)" : "var(--surface-alt)",
                  transition: "background 0.25s ease",
                  flexShrink: 0,
                  boxShadow: state ? "0 2px 8px var(--primary-soft)" : "none",
                }}
                aria-checked={state}
                role="switch"
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: state ? 23 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </label>
          ))}
        </div>
      </div>
    </>
  );
};

export default Settings;
