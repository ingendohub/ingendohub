import { NavLink, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    padding: '12px 16px',
    textDecoration: 'none',
    color: isActive ? '#0d6efd' : '#333',
    fontWeight: isActive ? '600' : '400',
    display: 'block',
  });

  return (
    <aside
      style={{
        width: 230,
        background: '#ffffff',
        borderRight: '1px solid #ddd',
        padding: '20px 0',
      }}
    >
      {/* Logo / Title */}
      <h2 style={{ textAlign: 'center', marginBottom: 30 }}>
        Xpresi Admin
      </h2>

      {/* Navigation */}
      <nav>
        <NavLink to="/dashboard" style={linkStyle}>
          📊 Dashboard
        </NavLink>

        <NavLink to="/dashboard/trips" style={linkStyle}>
          🚌 Trips
        </NavLink>

        <NavLink to="/dashboard/bookings" style={linkStyle}>
          📋 Bookings
        </NavLink>
      </nav>

      {/* Logout */}
      <div style={{ marginTop: 40, padding: '0 16px' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '10px',
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
