import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiClock, FiUsers, FiTruck, FiCalendar, FiShield, FiChevronRight, FiArrowLeft, FiBriefcase } from "react-icons/fi";
import { getPublicTrips } from "../../api/public/tripService";
import { useLang } from "../../i18n/LanguageContext";

const AvailableBuses = ({ trips: passedTrips, skipFetch, searchedRoute, searchedAgency, showPopular = true }) => {
  const navigate = useNavigate();
  const { t } = useLang();
  
  const [trips, setTrips] = useState(passedTrips || []);
  const [loading, setLoading] = useState(!skipFetch);
  const [error, setError] = useState("");
  
  // Wizard state
  const [selectedRoute, setSelectedRoute] = useState(searchedRoute || null); // {from, to}
  const [selectedAgency, setSelectedAgency] = useState(searchedAgency || null); // agency name
  const [isDirectSearch, setIsDirectSearch] = useState(!!searchedRoute);

  useEffect(() => {
    if (skipFetch) {
      setTrips(passedTrips || []);
      setLoading(false);
      return;
    }

    if (!skipFetch) {
      setLoading(true);
      getPublicTrips()
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : res.data?.trips || [];
          setTrips(data);
        })
        .catch((err) => {
          setError(err.response?.data?.message || t("booking_page_fail"));
          setTrips([]);
        })
        .finally(() => setLoading(false));
    }
  }, [skipFetch, passedTrips, t]);

  // Reset wizard if props changes significantly (like a new search)
  useEffect(() => {
    setSelectedRoute(searchedRoute || null);
    setSelectedAgency(searchedAgency || null);
    setIsDirectSearch(!!searchedRoute);
  }, [passedTrips, searchedRoute, searchedAgency]);

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();

  const handleBook = (tripId) => {
    if (!tripId) return;
    if (storedUser) {
      navigate(`/dashboard/booking/${tripId}`);
    } else {
      navigate(`/booking/${tripId}`);
    }
  };

  const formatDate = (value) => {
    if (!value) return t("buses_date_confirm");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const getOperatorName = (trip) =>
    trip.company?.name || trip.bus?.company?.name || "Trusted operator";

  // Data transformations
  const uniqueRoutes = useMemo(() => {
    const routesSet = new Set();
    const result = [];
    trips.forEach(trip => {
      const key = `${trip.from.trim().toLowerCase()}-${trip.to.trim().toLowerCase()}`;
      if (!routesSet.has(key)) {
        routesSet.add(key);
        result.push({ from: trip.from.trim(), to: trip.to.trim() });
      }
    });
    return result;
  }, [trips]);

  // Auto-select route if exactly 1
  useEffect(() => {
    if (uniqueRoutes.length === 1 && !selectedRoute) {
      setSelectedRoute(uniqueRoutes[0]);
    }
  }, [uniqueRoutes, selectedRoute]);

  const agenciesForRoute = useMemo(() => {
    if (!selectedRoute) return [];
    
    // Check ignoring case
    const filteredTrips = trips.filter(t => 
      t.from.toLowerCase() === selectedRoute.from.toLowerCase() &&
      t.to.toLowerCase() === selectedRoute.to.toLowerCase()
    );
    
    const agenciesSet = new Set();
    const result = [];
    filteredTrips.forEach(trip => {
      const name = getOperatorName(trip);
      if (!agenciesSet.has(name)) {
        agenciesSet.add(name);
        result.push(name);
      }
    });
    return result;
  }, [trips, selectedRoute]);

  const tripsToDisplay = useMemo(() => {
    if (!selectedRoute) return [];
    if (!isDirectSearch && !selectedAgency) return [];
    return trips.filter(t => 
      t.from.toLowerCase() === selectedRoute.from.toLowerCase() &&
      t.to.toLowerCase() === selectedRoute.to.toLowerCase() &&
      (!selectedAgency || getOperatorName(t) === selectedAgency)
    );
  }, [trips, selectedRoute, selectedAgency, isDirectSearch]);

  if (loading) {
    return (
      <section className="buses-section">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t("buses_loading")}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="buses-section">
        <div className="error-banner">{error}</div>
      </section>
    );
  }

  if (trips.length === 0) {
    return (
      <section className="buses-section">
        <div className="empty-state">
          <p>{t("buses_empty")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="buses-section" style={{ padding: '60px 5%' }}>
      <div className="section-header" style={{ marginBottom: '30px' }}>
        <div>
          <span className="section-kicker" style={{ color: '#1976d2', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {selectedAgency ? "Available Times" : selectedRoute ? "Select Agency" : t("buses_kicker")}
          </span>
          <h2 style={{ fontSize: '28px', color: '#0f172a', fontWeight: 800, marginTop: '8px' }}>
            {selectedAgency 
                ? `${selectedRoute.from} to ${selectedRoute.to}` 
                : selectedRoute 
                ? `Choose Agency for ${selectedRoute.from} to ${selectedRoute.to}`
                : "Available Routes"
            }
          </h2>
        </div>
        
        {/* Navigation Breadcrumbs / Back button */}
        {(selectedRoute && uniqueRoutes.length > 1) || selectedAgency ? (
           <button 
             onClick={() => {
                if (selectedAgency) {
                   setSelectedAgency(null);
                } else {
                   setSelectedRoute(null);
                }
             }}
             style={{ 
               display: 'flex', alignItems: 'center', gap: '8px', 
               background: 'transparent', border: 'none', 
               color: '#1976d2', fontWeight: 600, cursor: 'pointer',
               marginTop: '15px'
             }}
           >
             <FiArrowLeft /> Back
           </button>
        ) : null}
      </div>
      
      {showPopular && !selectedRoute && (() => {
        const popularRoutes = [
          { from: "Kigali", to: "Huye", emoji: "🏛️", desc: "Southern Province" },
          { from: "Kigali", to: "Rubavu", emoji: "🌊", desc: "Lake Kivu Resort" },
          { from: "Kigali", to: "Rwamagana", emoji: "🌿", desc: "Eastern Province" }
        ];

        // Get matching trips for each popular route
        const getTripsForRoute = (route) => {
          return trips.filter(t => 
            t.from.toLowerCase().trim() === route.from.toLowerCase() &&
            t.to.toLowerCase().trim() === route.to.toLowerCase()
          );
        };

        return (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ color: '#1976d2', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                ⚡ Quick Booking
              </span>
              <h3 style={{ fontSize: '22px', color: '#0f172a', fontWeight: 800, marginTop: '8px', marginBottom: '4px' }}>
                Popular Routes
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Book your seat directly from our most popular routes
              </p>
            </div>

            {popularRoutes.map((route, rIdx) => {
              const routeTrips = getTripsForRoute(route);
              return (
                <div key={rIdx} style={{ marginBottom: '32px' }}>
                  {/* Route header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 20px', marginBottom: '16px',
                    background: 'linear-gradient(135deg, #f0f6ff 0%, #fff 100%)',
                    border: '1.5px solid #e2e8f0', borderRadius: '14px',
                  }}>
                    <div style={{ 
                      width: 46, height: 46, borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #1976d2, #2196f3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', flexShrink: 0
                    }}>
                      {route.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '16px' }}>
                        {route.from} → {route.to}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{route.desc}</div>
                    </div>
                    <div style={{ 
                      background: routeTrips.length > 0 ? '#dcfce7' : '#fef3c7',
                      color: routeTrips.length > 0 ? '#16a34a' : '#d97706',
                      borderRadius: '20px', padding: '6px 14px',
                      fontSize: '12px', fontWeight: 700
                    }}>
                      {routeTrips.length > 0 ? `${routeTrips.length} trip${routeTrips.length > 1 ? 's' : ''} available` : 'No trips yet'}
                    </div>
                  </div>

                  {/* Trip cards for this route */}
                  {routeTrips.length > 0 ? (
                    <div className="buses-grid">
                      {routeTrips.map((trip) => {
                        const soldOut = trip.availableSeats === 0;
                        return (
                          <div key={trip._id} className="bus-card-modern">
                            <div className="bus-card-header">
                              <div>
                                <span className="operator-label">{t("buses_operator")}</span>
                                <h3>{getOperatorName(trip)}</h3>
                              </div>
                              <span className="price-tag">{trip.price?.toLocaleString()} RWF</span>
                            </div>
                            <div className="bus-card-body">
                              <div className="bus-route">
                                <FiMapPin className="route-icon" />
                                <span>{trip.from} → {trip.to}</span>
                              </div>
                              <div className="bus-name">
                                <FiTruck />
                                <span>{trip.bus?.model || t("buses_coach")} {trip.bus?.plateNumber ? `• ${trip.bus.plateNumber}` : ""}</span>
                              </div>
                              <div className="bus-detail">
                                <FiCalendar />
                                <span>{formatDate(trip.date)}</span>
                              </div>
                              <div className="bus-detail">
                                <FiClock />
                                <span style={{ fontWeight: 800, color: '#1976d2'}}>{trip.time || t("buses_time_confirm")}</span>
                              </div>
                              <div className="bus-detail">
                                <FiUsers />
                                <span>{trip.availableSeats} / {trip.totalSeats} {t("buses_seats")}</span>
                              </div>
                              <div className="seat-meter" aria-label={`${trip.availableSeats} ${t("buses_seats")}`}>
                                <span style={{ width: `${Math.max(4, Math.min(100, ((trip.availableSeats || 0) / (trip.totalSeats || 1)) * 100))}%` }} />
                              </div>
                            </div>
                            <div className="bus-card-footer">
                              <span className="verified-note"><FiShield /> {t("buses_qr_note")}</span>
                              <button
                                className={`btn-book ${soldOut ? "sold-out" : ""}`}
                                disabled={soldOut}
                                onClick={() => handleBook(trip._id)}
                              >
                                {soldOut ? t("buses_sold_out") : t("buses_book_now")}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', padding: '24px', 
                      color: '#94a3b8', fontSize: '14px',
                      background: '#fafbfc', borderRadius: '10px',
                      border: '1px dashed #e2e8f0'
                    }}>
                      No scheduled trips on this route currently. Check back soon!
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })()}


      <div style={{ minHeight: '300px' }}>
        {/* STEP 1: SELECT ROUTE */}
        {!selectedRoute && !isDirectSearch && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {uniqueRoutes.map((route, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedRoute(route)}
                style={{
                  background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  padding: '24px', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#1976d2';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f6ff', color: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <FiMapPin size={20} />
                   </div>
                   <div>
                     <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Route</p>
                     <p style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>{route.from} &rarr; {route.to}</p>
                   </div>
                </div>
                <FiChevronRight size={24} color="#94a3b8" />
              </div>
            ))}
          </div>
        )}

        {/* STEP 2: SELECT AGENCY */}
        {selectedRoute && !selectedAgency && !isDirectSearch && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {agenciesForRoute.map((agency, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedAgency(agency)}
                style={{
                  background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  padding: '24px', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#1976d2';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <FiBriefcase size={20} />
                   </div>
                   <div>
                     <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Operator</p>
                     <p style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>{agency}</p>
                   </div>
                </div>
                <FiChevronRight size={24} color="#94a3b8" />
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: SHOW TRIPS/TIMES */}
        {selectedRoute && (selectedAgency || isDirectSearch) && (
          <div className="buses-grid">
            {tripsToDisplay.map((trip) => {
              const soldOut = trip.availableSeats === 0;
              return (
                <div key={trip._id} className="bus-card-modern">
                  <div className="bus-card-header">
                    <div>
                      <span className="operator-label">{t("buses_operator")}</span>
                      <h3>{getOperatorName(trip)}</h3>
                    </div>
                    <span className="price-tag">{trip.price?.toLocaleString()} RWF</span>
                  </div>
                  <div className="bus-card-body">
                    <div className="bus-route">
                      <FiMapPin className="route-icon" />
                      <span>{trip.from} → {trip.to}</span>
                    </div>
                    <div className="bus-name">
                      <FiTruck />
                      <span>{trip.bus?.model || t("buses_coach")} {trip.bus?.plateNumber ? `• ${trip.bus.plateNumber}` : ""}</span>
                    </div>
                    <div className="bus-detail">
                      <FiCalendar />
                      <span>{formatDate(trip.date)}</span>
                    </div>
                    <div className="bus-detail">
                      <FiClock />
                      <span style={{ fontWeight: 800, color: '#1976d2'}}>{trip.time || t("buses_time_confirm")}</span>
                    </div>
                    <div className="bus-detail">
                      <FiUsers />
                      <span>{trip.availableSeats} / {trip.totalSeats} {t("buses_seats")}</span>
                    </div>
                    <div className="seat-meter" aria-label={`${trip.availableSeats} ${t("buses_seats")}`}>
                      <span style={{ width: `${Math.max(4, Math.min(100, ((trip.availableSeats || 0) / (trip.totalSeats || 1)) * 100))}%` }} />
                    </div>
                  </div>
                  <div className="bus-card-footer">
                    <span className="verified-note"><FiShield /> {t("buses_qr_note")}</span>
                    <button
                      className={`btn-book ${soldOut ? "sold-out" : ""}`}
                      disabled={soldOut}
                      onClick={() => handleBook(trip._id)}
                    >
                      {soldOut ? t("buses_sold_out") : t("buses_book_now")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default AvailableBuses;
