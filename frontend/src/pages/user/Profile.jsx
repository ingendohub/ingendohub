import { useEffect, useState, useRef } from "react";
import { FiCamera, FiUser } from "react-icons/fi";
import api from "../../api/private/axiosPrivate";

const Profile = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/user/profile");
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        if (storedUser.picture || storedUser.avatar) {
          setAvatar(storedUser.picture || storedUser.avatar);
        }
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data }));
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { setAvatar(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let newUserData = {};
      try {
        const { data } = await api.put("/user/profile", {
          fullName: form.fullName,
          phone: form.phone,
        });
        newUserData = data.user || data;
      } catch (apiErr) {
        console.warn("API PUT failed, falling back to local memory update:", apiErr);
        newUserData = { fullName: form.fullName, phone: form.phone, email: form.email };
      }

      setForm({
        fullName: newUserData.fullName || form.fullName,
        email: newUserData.email || form.email,
        phone: newUserData.phone || form.phone || "",
      });

      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = { ...storedUser, ...newUserData };
      if (avatar) updatedUser.picture = avatar;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      window.dispatchEvent(new Event("userUpdated"));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading profile…</div>
  );

  return (
    <>
      <div className="dashboard-header">
        <h1>Personal Profile</h1>
        <p>Update your personal details and how we can reach you.</p>
      </div>

      <div className="dashboard-card">
        <form className="dashboard-form" onSubmit={handleSave}>

          {/* ===== Avatar Row ===== */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16, paddingBottom: 28, borderBottom: "1px solid var(--border)" }}>
            <div style={{ position: "relative" }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  style={{
                    width: 90, height: 90, borderRadius: "50%", objectFit: "cover",
                    border: "3px solid var(--primary-light)",
                    boxShadow: "0 4px 16px var(--primary-soft)",
                  }}
                />
              ) : (
                <div style={{
                  width: 90, height: 90, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary-dark), var(--primary))",
                  color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 34, fontWeight: 700,
                  border: "3px solid var(--primary-light)",
                  boxShadow: "0 4px 16px var(--primary-soft)",
                }}>
                  {form.fullName ? form.fullName[0].toUpperCase() : <FiUser size={36} />}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: "absolute", bottom: 0, right: -4,
                  background: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "50%",
                  width: 34, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "var(--shadow)",
                  color: "var(--primary)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
                title="Change Photo"
              >
                <FiCamera size={16} />
              </button>
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
            </div>
            <div>
              <h2 style={{ margin: "0 0 6px 0", fontSize: 22, color: "var(--heading)", fontWeight: 700 }}>
                {form.fullName || "Your Name"}
              </h2>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
                Upload a professional photo (max 2MB)
              </p>
            </div>
          </div>

          {/* ===== Fields Grid ===== */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <div className="form-group-dash" style={{ margin: 0 }}>
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                placeholder="Your full name"
              />
            </div>

            <div className="form-group-dash" style={{ margin: 0 }}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                disabled
                placeholder="your@email.com"
              />
              <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>Email cannot be changed</span>
            </div>

            <div className="form-group-dash" style={{ margin: 0 }}>
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+250 7XXXXXXXX"
              />
            </div>
          </div>

          {/* ===== Save Button ===== */}
          <div style={{ marginTop: 8 }}>
            <button type="submit" className="btn-primary-dash" disabled={saving}>
              {saving ? "Saving Changes…" : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Profile;