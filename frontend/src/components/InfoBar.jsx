import { FiTruck, FiTag, FiShield } from "react-icons/fi";
import { useLang } from "../i18n/LanguageContext";

const InfoBar = () => {
  const { t } = useLang();
  return (
    <div className="info-bar">
      <div className="info-bar-items">
        <span><FiTruck className="info-icon" /> {t("infobar_route")}</span>
        <span><FiTag className="info-icon" /> {t("infobar_discount")}</span>
        <span><FiShield className="info-icon" /> {t("infobar_safety")}</span>
      </div>
    </div>
  );
};

export default InfoBar;