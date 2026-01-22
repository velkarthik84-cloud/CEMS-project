import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  UserPlus,
  ClipboardList,
  Trophy,
  Award,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEPARTMENT_NAV_ITEMS = [
  { path: '/department/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/department/events', label: 'View Events', icon: Calendar },
  { path: '/department/register', label: 'Register Students', icon: UserPlus },
  { path: '/department/registrations', label: 'My Registrations', icon: ClipboardList },
  { path: '/department/live-scores', label: 'Live Scores', icon: BarChart3 },
  { path: '/department/results', label: 'Results & Winners', icon: Trophy },
  { path: '/department/certificates', label: 'Certificates', icon: Award },
];

const DepartmentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [departmentSession, setDepartmentSession] = useState(null);

  useEffect(() => {
    // Check for department session
    const session = sessionStorage.getItem('departmentSession');
    if (!session) {
      toast.error('Please login to continue');
      navigate('/department/login');
      return;
    }
    setDepartmentSession(JSON.parse(session));
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('departmentSession');
    toast.success('Logged out successfully');
    navigate('/department/login');
  };

  const sidebarWidth = sidebarCollapsed ? '5rem' : '16rem';

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: sidebarWidth,
    backgroundColor: '#1E3A5F',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    zIndex: 50,
    transform: isLargeScreen ? 'translateX(0)' : (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'),
  };

  const navItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    backgroundColor: isActive ? 'rgba(233, 30, 99, 0.2)' : 'transparent',
    color: isActive ? '#E91E63' : '#94A3B8',
    transition: 'all 0.2s',
    textDecoration: 'none',
    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
  });

  if (!departmentSession) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && !isLargeScreen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Logo Section */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building2 style={{ width: '2rem', height: '2rem', color: '#E91E63' }} />
              <div>
                <h1 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#FFFFFF' }}>
                  Department
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                  {departmentSession.departmentCode}
                </p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <Building2 style={{ width: '2rem', height: '2rem', color: '#E91E63' }} />
          )}
          {!isLargeScreen && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X style={{ width: '1.5rem', height: '1.5rem', color: '#94A3B8' }} />
            </button>
          )}
        </div>

        {/* Department Name */}
        {!sidebarCollapsed && (
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>
              Department
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#FFFFFF', margin: '0.25rem 0 0 0' }}>
              {departmentSession.departmentName}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEPARTMENT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={navItemStyle(isActive)}
                    onClick={() => !isLargeScreen && setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <Icon style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                    {!sidebarCollapsed && (
                      <span style={{ fontSize: '0.875rem', fontWeight: isActive ? '600' : '400' }}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Toggle (Desktop) */}
        {isLargeScreen && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              position: 'absolute',
              right: '-12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#1E3A5F',
              border: '2px solid #E91E63',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {sidebarCollapsed ? (
              <ChevronRight style={{ width: '14px', height: '14px', color: '#E91E63' }} />
            ) : (
              <ChevronLeft style={{ width: '14px', height: '14px', color: '#E91E63' }} />
            )}
          </button>
        )}

        {/* Logout Button */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut style={{ width: '1.25rem', height: '1.25rem' }} />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
          transition: 'margin-left 0.3s ease',
          marginLeft: isLargeScreen ? sidebarWidth : 0,
        }}
      >
        {/* Top Header */}
        <header style={{
          backgroundColor: '#FFFFFF',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!isLargeScreen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <Menu style={{ width: '1.5rem', height: '1.5rem', color: '#1E293B' }} />
              </button>
            )}
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
              {DEPARTMENT_NAV_ITEMS.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              backgroundColor: '#1E3A5F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: '0.875rem',
            }}>
              {departmentSession.departmentCode?.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '1.25rem',
          overflowX: 'hidden',
          overflowY: 'auto',
          width: '100%',
          maxWidth: '100%',
        }}>
          <Outlet context={{ departmentSession }} />
        </main>
      </div>
    </div>
  );
};

export default DepartmentLayout;
