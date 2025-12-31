import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#F5F7FA',
  };

  const mainWrapperStyle = {
    transition: 'all 0.3s ease',
    marginLeft: 0,
  };

  const mainContentStyle = {
    padding: '1rem',
  };

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        style={mainWrapperStyle}
        className={sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      >
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main style={mainContentStyle} className="lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
