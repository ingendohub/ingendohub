import React from "react";
import { useLang } from "../../i18n/LanguageContext";
import "../../styles/content-pages.css";

const TermsConditions = () => {
  const { t } = useLang();
  return (
    <main className="content-page legal-page">
      <div className="legal-container">
        <h1>{t("terms_title")}</h1>
        <p className="legal-effective">{t("terms_effective")}</p>

        <h2>{t("terms_booking_title")}</h2>
        <ul>
          <li>{t("terms_booking1")}</li>
          <li>{t("terms_booking2")}</li>
          <li>{t("terms_booking3")}</li>
        </ul>

        <h2>{t("terms_ticket_title")}</h2>
        <ul>
          <li>{t("terms_ticket1")}</li>
          <li>{t("terms_ticket2")}</li>
          <li>{t("terms_ticket3")}</li>
        </ul>

        <h2>{t("terms_cancel_title")}</h2>
        <ul>
          <li>{t("terms_cancel1")}</li>
          <li>{t("terms_cancel2")}</li>
          <li>{t("terms_cancel3")}</li>
        </ul>

        <h2>{t("terms_user_title")}</h2>
        <ul>
          <li>{t("terms_user1")}</li>
          <li>{t("terms_user2")}</li>
          <li>{t("terms_user3")}</li>
        </ul>

        <h2>{t("terms_liability_title")}</h2>
        <ul>
          <li>{t("terms_liability1")}</li>
          <li>{t("terms_liability2")}</li>
        </ul>

        <h2>{t("terms_mod_title")}</h2>
        <p>{t("terms_mod")}</p>

        <p>
          {t("terms_contact")}{" "}
          <strong>support@ingendohub.rw</strong>
        </p>
      </div>
    </main>
  );
};

export default TermsConditions;
