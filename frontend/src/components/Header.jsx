import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiTruck,
  FiInfo, FiMail, FiMoon, FiSun, FiChevronDown, FiGlobe,
  FiPackage, FiCreditCard, FiSettings, FiStar,
  FiHome, FiHelpCircle, FiPhone, FiMessageCircle, FiMessageSquare
} from "react-icons/fi";
import logo from "../assets/logo.svg";
import "../styles/header.css";
import { useLang } from "../i18n/LanguageContext";

const Header = ({ onOpenLogin, onOpenSignup }) => {
  const navigate = useNavigate();
  const { t, lang, setLang, LANGUAGES } = useLang();
       
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const userMenuRef = useRef(null);
  const mobileUserMenuRef = useRef(null);
  const langMenuRef = useRef(null);
  const contactMenuRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      const clickedOutsideDesktop = userMenuRef.current && !userMenuRef.current.contains(e.target);
      const clickedOutsideMobile = mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(e.target);
      
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setUserMenuOpen(false);
      }
      
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangMenuOpen(false);
      if (contactMenuRef.current && !contactMenuRef.current.contains(e.target)) setContactMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [storedUser, setStoredUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try { setStoredUser(JSON.parse(localStorage.getItem("user"))); }
      catch { setStoredUser(null); }
    };
    window.addEventListener('userUpdated', handleUpdate);
    return () => window.removeEventListener('userUpdated', handleUpdate);
  }, []);

  const storedCompany = (() => {
    try { return JSON.parse(localStorage.getItem("company")); }
    catch { return null; }
  })();
  const token = localStorage.getItem("token") || localStorage.getItem("companyToken");

  const isLoggedIn = !!token;
  const isCompany = !!storedCompany;
  const isAdmin = storedUser?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    localStorage.removeItem("companyToken");
    navigate("/");
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <header className="site-header">
      <div className="header-container">


        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src={logo} alt="Ingendohub Logo" />
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav">
          <Link to="/" className="nav-link"><FiHome className="nav-icon" /> {t("nav_home")}</Link>
          <Link to="/available-buses" className="nav-link"><FiTruck className="nav-icon" /> {t("nav_buses")}</Link>
          <Link to="/about" className="nav-link"><FiInfo className="nav-icon" /> {t("nav_about")}</Link>
        </nav>

        {/* Actions (Desktop) */}
        <div className="header-actions">
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={() => setTheme((c) => (c === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          {/* Language Switcher */}
          <div className="lang-menu-wrapper" ref={langMenuRef}>
            <button
              className="lang-toggle"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-label="Change language"
            >
              <span className="lang-flag">{currentLang.flag}</span>
              <span className="lang-code" style={{marginLeft: '4px', fontSize: '13px', fontWeight: 'bold'}}>{currentLang.short}</span>
            </button>
            {langMenuOpen && (
              <div className="lang-dropdown">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    className={`lang-option ${lang === l.code ? "active" : ""}`}
                    onClick={() => { setLang(l.code); setLangMenuOpen(false); }}
                  >
                    <span className="lang-flag">{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && <span className="lang-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support */}
          <Link
            to="/contact"
            className="theme-toggle"
            aria-label="Help Centre"
            style={{ background: 'transparent', border: 'none', color: 'var(--heading)' }}
          >
            <FiHelpCircle size={22} />
          </Link>

          {/* Auth Area */}
          {!isLoggedIn ? (
            <div className="guest-profile-wrapper" ref={userMenuRef}>
              <button
                className="guest-profile-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Guest profile menu"
              >
                <span className="guest-avatar-icon">
                  <FiUser size={18} />
                </span>
                <div className="guest-text">
                  <span className="guest-title">{t("nav_guest")}</span>
                  <span className="guest-subtitle">{t("nav_guest_subtitle")}</span>
                </div>
                <FiChevronDown className={`lang-chevron ${userMenuOpen ? "open" : ""}`} />
              </button>
              {userMenuOpen && (
                <div className="guest-dropdown">
                  <button
                    className="guest-dropdown-signin"
                    onClick={() => { onOpenLogin(); setUserMenuOpen(false); }}
                  >
                    {t("nav_signin")}
                  </button>
                  <div className="guest-dropdown-divider">
                    <span>{t("login_no_account")}</span>
                  </div>
                  <button
                    className="guest-dropdown-signup"
                    onClick={() => { onOpenSignup(); setUserMenuOpen(false); }}
                  >
                    {t("nav_signup")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button className="btn-avatar" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                {(storedUser?.picture || storedUser?.avatar) ? (
                  <img src={storedUser.picture || storedUser.avatar} alt="Profile" className="header-avatar-img" />
                ) : (
                  <div className="header-avatar-init">
                    {(storedUser?.fullName || storedUser?.name || storedCompany?.name || "U")[0].toUpperCase()}
                  </div>
                )}
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  {isCompany && (
                    <button onClick={() => { navigate("/company"); setUserMenuOpen(false); }}>
                      <FiGrid /> {t("nav_dashboard")}
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => { navigate("/admin/dashboard"); setUserMenuOpen(false); }}>
                      <FiGrid /> {t("nav_admin")}
                    </button>
                  )}
                  {!isCompany && !isAdmin && (
                    <>
                      <button onClick={() => { navigate("/dashboard/profile"); setUserMenuOpen(false); }}>
                        <FiUser /> My profile
                      </button>
                      <button onClick={() => { navigate("/dashboard/my-trips"); setUserMenuOpen(false); }}>
                        <FiPackage /> Bookings & Tickets
                      </button>
                      <button onClick={() => { navigate("/dashboard/payments"); setUserMenuOpen(false); }}>
                        <FiCreditCard /> Payment History
                      </button>
                      <button onClick={() => { navigate("/dashboard/settings"); setUserMenuOpen(false); }}>
                        <FiSettings /> Account Settings
                      </button>
                      <button onClick={() => { navigate("/dashboard/reviews"); setUserMenuOpen(false); }}>
                        <FiStar /> Rate & Review Us
                      </button>
                    </>
                  )}
                  <button onClick={handleLogout} className="logout-btn">
                    <FiLogOut /> {t("nav_logout")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mobile-actions-right">
          {/* Mobile User Profile (Visible ONLY on mobile) */}
          <div className="mobile-profile-area" ref={mobileUserMenuRef}>
            {!isLoggedIn ? (
              <button className="mobile-login-icon" onClick={() => onOpenLogin()} aria-label="Sign in">
                <FiUser size={20} />
              </button>
            ) : (
              <button className="btn-avatar mobile-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                {(storedUser?.picture || storedUser?.avatar) ? (
                  <img src={storedUser.picture || storedUser.avatar} alt="Profile" className="header-avatar-img" />
                ) : (
                  <div className="header-avatar-init">
                    {(storedUser?.fullName || storedUser?.name || storedCompany?.name || "U")[0].toUpperCase()}
                  </div>
                )}
              </button>
            )}

            {/* Quick Dropdown for Mobile Profile */}
            {userMenuOpen && window.innerWidth <= 900 && (
              <div className="user-dropdown mobile-user-dropdown visible">
                {isCompany && (
                  <button onClick={() => { navigate("/company"); setUserMenuOpen(false); }}>
                    <FiGrid /> {t("nav_dashboard")}
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => { navigate("/admin/dashboard"); setUserMenuOpen(false); }}>
                    <FiGrid /> {t("nav_admin")}
                  </button>
                )}
                {!isCompany && !isAdmin && (
                  <>
                    <button onClick={() => { navigate("/dashboard/profile"); setUserMenuOpen(false); }}>
                      <FiUser /> My profile
                    </button>
                    <button onClick={() => { navigate("/dashboard/my-trips"); setUserMenuOpen(false); }}>
                      <FiPackage /> Bookings & Tickets
                    </button>
                    <button onClick={() => { navigate("/dashboard/payments"); setUserMenuOpen(false); }}>
                      <FiCreditCard /> Payment History
                    </button>
                    <button onClick={() => { navigate("/dashboard/settings"); setUserMenuOpen(false); }}>
                      <FiSettings /> Account Settings
                    </button>
                    <button onClick={() => { navigate("/dashboard/reviews"); setUserMenuOpen(false); }}>
                      <FiStar /> Rate & Review Us
                    </button>
                  </>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  <FiLogOut /> {t("nav_logout")}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — conditionally rendered */}
      {menuOpen && (
        <div className="mobile-menu">
          
          <nav className="mobile-main-nav">
            <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-nav-link"><FiHome className="nav-icon" /> {t("nav_home")}</Link>
            <Link to="/available-buses" onClick={() => setMenuOpen(false)} className="mobile-nav-link"><FiTruck className="nav-icon" /> {t("nav_buses")}</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="mobile-nav-link"><FiInfo className="nav-icon" /> {t("nav_about")}</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="mobile-nav-link"><FiHelpCircle className="nav-icon" /> {t("nav_contact")}</Link>
          </nav>

          <div className="mobile-lang-row">
            <FiGlobe />
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                className={`mobile-lang-btn ${lang === l.code ? "active" : ""}`}
                onClick={() => { setLang(l.code); }}
              >
                {l.flag} {l.code.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            className="theme-toggle mobile-theme-toggle"
            type="button"
            onClick={() => setTheme((c) => (c === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
            {theme === "dark" ? t("nav_light_mode") : t("nav_dark_mode")}
          </button>

          {!isLoggedIn && (
            <div className="mobile-auth-btns">
              <button className="btn-outline mobile-btn" onClick={() => { onOpenLogin(); setMenuOpen(false); }}>
                {t("nav_signin")}
              </button>
              <button className="btn-primary mobile-btn" onClick={() => { onOpenSignup(); setMenuOpen(false); }}>
                {t("nav_signup")}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
