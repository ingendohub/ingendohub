import { createContext, useContext, useState, useEffect } from "react";
import translations from "./translations";
import ReactCountryFlag from "react-country-flag";

const LanguageContext = createContext();

const LANGUAGES = [
  { code: "en", label: "English", short: "EN", flag: <ReactCountryFlag countryCode="GB" svg style={{width: '1.2em', height: '1.2em', borderRadius: '50%', objectFit: 'cover'}} /> },
  { code: "fr", label: "Français", short: "FR", flag: <ReactCountryFlag countryCode="FR" svg style={{width: '1.2em', height: '1.2em', borderRadius: '50%', objectFit: 'cover'}} /> },
  { code: "rw", label: "Kinyarwanda", short: "RW", flag: <ReactCountryFlag countryCode="RW" svg style={{width: '1.2em', height: '1.2em', borderRadius: '50%', objectFit: 'cover'}} /> },
];

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] ?? translations["en"]?.[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);

export default LanguageContext;
