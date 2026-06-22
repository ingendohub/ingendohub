import React from "react";
import {
  FiCheckCircle, FiCreditCard, FiGlobe, FiMapPin, FiShield, FiUsers,
} from "react-icons/fi";
import { useLang } from "../../i18n/LanguageContext";

const AboutUs = () => {
  const { t } = useLang();
  return (
    <main className="content-page">
      <section className="page-hero about-hero">
        <span className="section-kicker">{t("about_kicker")}</span>
        <h1>{t("about_title")}</h1>
        <p>{t("about_subtitle")}</p>
      </section>

      <section className="trust-strip">
        <div>
          <strong>{t("about_live")}</strong>
          <span>{t("about_live_sub")}</span>
        </div>
        <div>
          <strong>{t("about_secure")}</strong>
          <span>{t("about_secure_sub")}</span>
        </div>
        <div>
          <strong>{t("about_qr")}</strong>
          <span>{t("about_qr_sub")}</span>
        </div>
      </section>

      <section className="about-grid">
        <div className="about-copy">
          <span className="section-kicker">{t("about_what")}</span>
          <h2>{t("about_experience")}</h2>
          <p>{t("about_desc1")}</p>
          <p>{t("about_desc2")}</p>
        </div>

        <div className="value-list">
          <div><FiGlobe /><span>{t("about_routes")}</span></div>
          <div><FiCreditCard /><span>{t("about_payment")}</span></div>
          <div><FiShield /><span>{t("about_qr2")}</span></div>
          <div><FiUsers /><span>{t("about_dashboards")}</span></div>
        </div>
      </section>

      <section className="process-section">
        <span className="section-kicker">{t("about_how")}</span>
        <h2>{t("about_steps")}</h2>
        <div className="process-grid">
          <div><FiMapPin /><h3>{t("about_step1_title")}</h3><p>{t("about_step1")}</p></div>
          <div><FiCheckCircle /><h3>{t("about_step2_title")}</h3><p>{t("about_step2")}</p></div>
          <div><FiCreditCard /><h3>{t("about_step3_title")}</h3><p>{t("about_step3")}</p></div>
          <div><FiShield /><h3>{t("about_step4_title")}</h3><p>{t("about_step4")}</p></div>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
