import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";
import { useLang } from "../../i18n/LanguageContext";

const NotFound = () => {
  const { t } = useLang();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 200px)',
      textAlign: 'center',
      padding: '40px 20px',
      color: '#0f172a'
    }}>
      <FiAlertTriangle size={80} color="#e53e3e" style={{ marginBottom: '24px' }} />
      <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 16px 0' }}>404</h1>
      <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 16px 0', color: '#334155' }}>
        Oops! Page Not Found (Page intabonetse)
      </h2>
      <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '500px', marginBottom: '32px' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#1976d2',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'background 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#1565c0'}
        onMouseOut={(e) => e.currentTarget.style.background = '#1976d2'}
      >
        <FiHome size={18} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
