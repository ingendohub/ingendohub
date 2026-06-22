import React from 'react';
import { FiTrendingUp, FiMapPin, FiAward, FiTag, FiSearch } from 'react-icons/fi';
import { useLang } from '../i18n/LanguageContext';

const SuggestedDeals = () => {
  const { t } = useLang();

  const deals = [
    {
      id: 1,
      icon: <FiTag size={24} color="#1976d2" />,
      title: "Exclusive Desktop App Offer",
      desc: "Save up to 15% on your next booking when you use our official upcoming mobile and desktop application.",
      badge: "Save 15%",
      bg: "#f0f4ff",
      border: "#d7deea"
    },
    {
      id: 2,
      icon: <FiMapPin size={24} color="#059669" />,
      title: "Discover Kigali's Premium Sites",
      desc: "Book a guided tour through Rwanda's rich history and vibrant Kigali neighborhoods.",
      badge: "Top Rated",
      bg: "#ecfdf5",
      border: "#a7f3d0"
    },
    {
      id: 3,
      icon: <FiAward size={24} color="#d97706" />,
      title: "VIP Executive Travel",
      desc: "Upgrade to Executive Class on VIP buses with extra legroom, refreshments, and WiFi.",
      badge: "Upgrade",
      bg: "#fffbeb",
      border: "#fde68a"
    }
  ];

  return (
    <div className="suggested-deals-container" style={{ marginTop: '40px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          Recommended specifically for you
        </h3>
        <button style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Explore all <FiTrendingUp />
        </button>
      </div>

      <div className="deals-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {deals.map(deal => (
          <div key={deal.id} className="deal-card" style={{
            background: deal.bg,
            border: `1.5px solid ${deal.border}`,
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: '#fff',
              color: '#0f172a',
              fontSize: '12px',
              fontWeight: '800',
              padding: '6px 12px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              {deal.badge}
            </div>
            
            <div style={{
              width: '48px', height: '48px',
              background: '#fff',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              {deal.icon}
            </div>
            
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
              {deal.title}
            </h4>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
              {deal.desc}
            </p>
            
            <button style={{
              background: '#fff',
              border: `1.5px solid ${deal.border}`,
              color: '#0f172a',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              View Details &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedDeals;
