import heroImage from "../images/image1.jpeg";
import { useLang } from "../i18n/LanguageContext";

const Hero = ({ children }) => {
  const { t } = useLang();

  return (
    <section
      className="hero-section hero-animated-bg"
      style={{
        backgroundImage: `linear-gradient(100deg, rgba(5, 18, 36, 0.85) 0%, rgba(5, 18, 36, 0.45) 60%, rgba(25, 118, 210, 0.25) 100%), url(${heroImage})`
      }}
    >
      <div className="hero-content">
        <span className="hero-eyebrow">{t("hero_eyebrow")}</span>
        <h1>{t("hero_title")}</h1>
        <p>{t("hero_subtitle")}</p>
      </div>

      {children}
    </section>
  );
};

export default Hero;
