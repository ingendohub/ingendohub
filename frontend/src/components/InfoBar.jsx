import { FiTruck, FiTag, FiShield, FiStar, FiZap } from "react-icons/fi";
import { useLang } from "../i18n/LanguageContext";

const InfoBar = () => {
  const { t } = useLang();

  const items = [
    { icon: <FiTruck className="info-icon" />, text: t("infobar_route") },
    { icon: <FiTag className="info-icon" />, text: t("infobar_discount") },
    { icon: <FiShield className="info-icon" />, text: t("infobar_safety") },
    { icon: <FiStar className="info-icon" />, text: "Book your seat in 60 seconds" },
    { icon: <FiZap className="info-icon" />, text: "Instant e-ticket delivery" },
  ];

  // Duplicate for seamless loop
  const marqueeItems = [...items, ...items];

  return (
    <div className="info-bar">
      {/* Desktop: static centered layout */}
      <div className="info-bar-items info-bar-desktop">
        {items.map((item, i) => (
          <span key={i}>{item.icon} {item.text}</span>
        ))}
      </div>

      {/* Mobile: marquee scrolling */}
      <div className="info-bar-marquee-wrap" aria-hidden="true">
        <div className="info-bar-marquee">
          {marqueeItems.map((item, i) => (
            <span key={i} className="info-bar-marquee-item">
              {item.icon} {item.text}
              <span className="info-bar-sep">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoBar;