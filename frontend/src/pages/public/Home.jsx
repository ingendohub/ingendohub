import { useEffect, useState, useMemo } from "react";
import InfoBar from "../../components/InfoBar";
import Hero from "../../components/Hero";
import BookingForm from "../../components/BookingForm";
import Loader from "../../components/Loader";
import AvailableBuses from "./AvailableBuses";
import { getPublicTrips } from "../../api/public/tripService";
import { FiTruck, FiCalendar, FiDollarSign, FiShield } from "react-icons/fi";
import { useLang } from "../../i18n/LanguageContext";

const Home = () => {
  const { t } = useLang();
  const [trips, setTrips] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchedRoute, setSearchedRoute] = useState(null);
  const [searchedAgency, setSearchedAgency] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const { data } = await getPublicTrips();
        const tripsArray = Array.isArray(data) ? data : data.trips || [];
        setAllTrips(tripsArray);
        setTrips(tripsArray);
      } catch (error) {
        if (error.response?.status === 429) {
          console.warn("Too many requests! Please wait a few seconds.");
        } else {
          console.error("Failed to load trips", error);
        }
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const uniqueAgencies = useMemo(() => {
    const agenciesSet = new Set();
    const result = [];
    allTrips.forEach(trip => {
      const name = trip.company?.name || trip.bus?.company?.name;
      if (name && !agenciesSet.has(name)) {
        agenciesSet.add(name);
        result.push(name);
      }
    });
    return result;
  }, [allTrips]);

  return (
    <>
      {loading && <Loader />}
      <InfoBar />
      <Hero>
        <BookingForm
          allTrips={allTrips}
          onResults={(results, payload) => {
            setTrips(Array.isArray(results) ? results : allTrips);
            setHasSearched(!!payload);
            if (payload) {
              setSearchedRoute(payload.searchedRoute);
              setSearchedAgency(payload.searchedAgency);
            } else {
              setSearchedRoute(null);
              setSearchedAgency(null);
            }
          }}
        />
      </Hero>

      {/* Available buses (shown below search when user didn't use the inline results) */}
      <AvailableBuses
        trips={trips}
        skipFetch
        searchedRoute={searchedRoute}
        searchedAgency={searchedAgency}
        showPopular={false}
      />

      {/* Trusted Agencies */}
      {!loading && uniqueAgencies.length > 0 && (
        <section className="agencies-section">
          <h3>Trusted Agencies We Work With</h3>
          <div className="agencies-pills">
            {uniqueAgencies.map((agency, idx) => (
              <div key={idx} className="agency-pill">
                {agency}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feature Cards */}
      <section className="hero-features">
        <div className="feature-card">
          <div className="feature-icon"><FiTruck /></div>
          <h4>{t("hero_wide")}</h4>
          <p>{t("hero_wide_sub")}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><FiCalendar /></div>
          <h4>{t("hero_schedule")}</h4>
          <p>{t("hero_schedule_sub")}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><FiDollarSign /></div>
          <h4>{t("hero_payment")}</h4>
          <p>{t("hero_payment_sub")}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><FiShield /></div>
          <h4>{t("hero_tickets")}</h4>
          <p>{t("hero_tickets_sub")}</p>
        </div>
      </section>
    </>
  );
};

export default Home;
