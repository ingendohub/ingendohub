import React from "react";
import { useLang } from "../../i18n/LanguageContext";
import "../../styles/content-pages.css";

const PrivacyPolicy = () => {
  const { t } = useLang();
  return (
    <main className="content-page legal-page">
      <div className="legal-container">
        <h1>{t("privacy_title")}</h1>
        <p className="legal-effective">{t("privacy_effective")}</p>
        <p>{t("privacy_intro")}</p>

        <h2>{t("privacy_collect_title")}</h2>
        <ul>
          <li>{t("privacy_collect1")}</li>
          <li>{t("privacy_collect2")}</li>
          <li>{t("privacy_collect3")}</li>
        </ul>

        <h2>{t("privacy_use_title")}</h2>
        <ul>
          <li>{t("privacy_use1")}</li>
          <li>{t("privacy_use2")}</li>
          <li>{t("privacy_use3")}</li>
          <li>{t("privacy_use4")}</li>
        </ul>

        <h2>{t("privacy_protection_title")}</h2>
        <p>{t("privacy_protection")}</p>

        <h2>{t("privacy_cookies_title")}</h2>
        <p>{t("privacy_cookies")}</p>

        <h2>{t("privacy_rights_title")}</h2>
        <ul>
          <li>{t("privacy_rights1")}</li>
          <li>{t("privacy_rights2")}</li>
          <li>{t("privacy_rights3")}</li>
        </ul>

        <p>
          {t("privacy_contact")}{" "}
          <strong>support@ingendohub.rw</strong>
        </p>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
