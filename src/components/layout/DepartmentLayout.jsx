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
    const session = sessionStorage.getItem('departmentSession');
    if (!session) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    setDepartmentSession(JSON.parse(session));
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      const large = window.innerWidth >= 1024;
      setIsLargeScreen(large);
      if (large) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('departmentSession');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const sidebarWidth = sidebarCollapsed ? '5rem' : '16rem';

  if (!departmentSession) {
    return null;
  }

  return (
    <>
      <style>{`
        .dept-layout {
          display: flex;
          min-height: 100vh;
          background-color: #F8FAFC;
        }

        .dept-sidebar-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 40;
          display: none;
        }

        .dept-sidebar-overlay.active {
          display: block;
        }

        .dept-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          background-color: #1E3A5F;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          z-index: 50;
          transform: translateX(-100%);
        }

        .dept-sidebar.open {
          transform: translateX(0);
        }

        .dept-sidebar.collapsed {
          width: 5rem;
        }

        .dept-sidebar:not(.collapsed) {
          width: 16rem;
        }

        .dept-sidebar-header {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dept-sidebar-close {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dept-sidebar-info {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dept-sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          overflow-y: auto;
        }

        .dept-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .dept-nav-item.active {
          background-color: rgba(233, 30, 99, 0.2);
          color: #E91E63;
          font-weight: 600;
        }

        .dept-nav-item:not(.active) {
          background-color: transparent;
          color: #94A3B8;
        }

        .dept-nav-item:not(.active):hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
        }

        .dept-sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dept-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background-color: rgba(239, 68, 68, 0.1);
          color: #EF4444;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .dept-collapse-btn {
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #1E3A5F;
          border: 2px solid #E91E63;
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .dept-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-width: 0;
          transition: margin-left 0.3s ease;
          margin-left: 0;
        }

        .dept-header {
          background-color: #FFFFFF;
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .dept-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .dept-menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
        }

        .dept-header-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1E293B;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dept-content {
          flex: 1;
          padding: 1rem;
          overflow-x: hidden;
          overflow-y: auto;
          width: 100%;
          max-width: 100%;
        }

        @media (min-width: 640px) {
          .dept-header {
            padding: 1rem 1.5rem;
          }

          .dept-header-title {
            font-size: 1.25rem;
          }

          .dept-content {
            padding: 1.25rem;
          }
        }

        @media (min-width: 1024px) {
          .dept-sidebar {
            transform: translateX(0);
          }

          .dept-sidebar-overlay {
            display: none !important;
          }

          .dept-sidebar-close {
            display: none;
          }

          .dept-collapse-btn {
            display: flex;
          }

          .dept-menu-btn {
            display: none;
          }

          .dept-main {
            margin-left: ${sidebarWidth};
          }

          .dept-sidebar-header {
            padding: 1.5rem;
          }

          .dept-content {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className="dept-layout">
        {/* Mobile Overlay */}
        <div
          className={`dept-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`dept-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="dept-sidebar-header">
            <Building2 style={{ width: '2rem', height: '2rem', color: '#E91E63', flexShrink: 0 }} />
            {!sidebarCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <h1 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#FFFFFF' }}>
                  Department
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                  {departmentSession.departmentCode}
                </p>
              </div>
            )}
            <button onClick={() => setSidebarOpen(false)} className="dept-sidebar-close">
              <X style={{ width: '1.5rem', height: '1.5rem', color: '#94A3B8' }} />
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="dept-sidebar-info">
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>
                Department
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#FFFFFF', margin: '0.25rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {departmentSession.departmentName}
              </p>
            </div>
          )}

          <nav className="dept-sidebar-nav">
            {DEPARTMENT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`dept-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : ''}
                  style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
                >
                  <Icon style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {isLargeScreen && (
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="dept-collapse-btn">
              {sidebarCollapsed ? (
                <ChevronRight style={{ width: '14px', height: '14px', color: '#E91E63' }} />
              ) : (
                <ChevronLeft style={{ width: '14px', height: '14px', color: '#E91E63' }} />
              )}
            </button>
          )}

          <div className="dept-sidebar-footer">
            <button
              onClick={handleLogout}
              className="dept-logout-btn"
              style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
            >
              <LogOut style={{ width: '1.25rem', height: '1.25rem' }} />
              {!sidebarCollapsed && 'Logout'}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="dept-main" style={{ marginLeft: isLargeScreen ? sidebarWidth : 0 }}>
          <header className="dept-header">
            <div className="dept-header-left">
              <button onClick={() => setSidebarOpen(true)} className="dept-menu-btn">
                <Menu style={{ width: '1.5rem', height: '1.5rem', color: '#1E293B' }} />
              </button>
              <h2 className="dept-header-title">
                {DEPARTMENT_NAV_ITEMS.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            <div style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              backgroundColor: '#1E3A5F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: '0.75rem',
              flexShrink: 0,
            }}>
              {departmentSession.departmentCode?.slice(0, 2).toUpperCase()}
            </div>
          </header>

          <main className="dept-content">
            <Outlet context={{ departmentSession }} />
          </main>
        </div>
      </div>
    </>
  );
};

export default DepartmentLayout;
