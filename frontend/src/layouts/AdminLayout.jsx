import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px', background: '#f5f6fa' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;