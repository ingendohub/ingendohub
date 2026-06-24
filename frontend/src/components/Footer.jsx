import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "../styles/footer.css";
import { useLang } from "../i18n/LanguageContext";

const Footer = () => {
  const { t, lang, setLang, LANGUAGES } = useLang();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>INGENDOHUB</h3>
          <p>{t("footer_tagline")}</p>
        </div>
        <div className="footer-links">
          <h4>{t("footer_links")}</h4>
          <Link to="/">{t("footer_home")}</Link>
          <Link to="/about">{t("footer_about")}</Link>
          <Link to="/contact">{t("footer_contact")}</Link>
          <Link to="/privacy">{t("footer_privacy")}</Link>
          <Link to="/terms">{t("footer_terms")}</Link>
        </div>
        <div className="footer-social">
          <h4>{t("footer_social")}</h4>
          <div className="social-icons">
            <a href="https://www.facebook.com/profile.php?id=61590588043293" target="_blank" rel="noreferrer"><FaFacebook /></a>
            <a href="https://www.instagram.com/ingendohub/?hl=en" target="_blank" rel="noreferrer"><FaInstagram /></a>
            <a href="https://x.com/ingendohub" target="_blank" rel="noreferrer"><FaXTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedin /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <p>&copy; {new Date().getFullYear()} Ingendohub. {t("footer_rights")}</p>
        
        {/* Language Switcher Footer */}
        <div className="lang-menu-wrapper" ref={langMenuRef} style={{ position: 'relative' }}>
          <button
            className="lang-toggle"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            aria-label="Change language"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span className="lang-flag" title={`Change language - currently ${currentLang.label}`}>{currentLang.flag}</span>
            <span className="lang-code" style={{fontSize: '14px', fontWeight: 'bold', color: 'inherit'}}>{currentLang.short}</span>
          </button>
          {langMenuOpen && (
            <div className="lang-dropdown" style={{ bottom: '100%', top: 'auto', right: 0, marginBottom: '0.5rem' }}>
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
      </div>
    </footer>
  );
};

export default Footer;