import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Users,
  UserCheck,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const iconMap = {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Users,
  UserCheck,
  CreditCard,
  BarChart3,
  Settings,
};

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: 'LayoutDashboard', exact: true },
  { path: '/admin/events', label: 'Events', icon: 'Calendar' },
  { path: '/admin/events/create', label: 'Create Event', icon: 'PlusCircle' },
  { path: '/admin/participants', label: 'Participants', icon: 'Users' },
  { path: '/admin/attendance', label: 'Attendance', icon: 'UserCheck' },
  { path: '/admin/payments', label: 'Payments', icon: 'CreditCard' },
  { path: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/admin/settings', label: 'Settings', icon: 'Settings' },
];

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { logout, userProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 50,
    height: '100%',
    backgroundColor: '#1E3A5F',
    color: '#FFFFFF',
    transition: 'all 0.3s ease-in-out',
    width: collapsed ? '5rem' : '16rem',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    display: 'flex',
    flexDirection: 'column',
  };

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '4rem',
    padding: '0 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const logoIconStyle = {
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: '#E91E63',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const navStyle = {
    flex: 1,
    padding: '1rem 0.75rem',
    overflowY: 'auto',
  };

  const navItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease',
    marginBottom: '0.25rem',
    backgroundColor: isActive ? '#E91E63' : 'transparent',
    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
    textDecoration: 'none',
    cursor: 'pointer',
  });

  const footerStyle = {
    padding: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const userProfileStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.5rem',
  };

  const userAvatarStyle = {
    width: '2rem',
    height: '2rem',
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '500',
  };

  const collapseButtonStyle = {
    position: 'absolute',
    right: '-0.75rem',
    top: '5rem',
    width: '1.5rem',
    height: '1.5rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1E3A5F',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          style={overlayStyle}
          onClick={onClose}
          className="lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        style={sidebarStyle}
        className="lg:translate-x-0"
      >
        {/* Logo */}
        <div style={logoContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={logoIconStyle}>
              <span style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '1.125rem' }}>V</span>
            </div>
            {!collapsed && (
              <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Ventixe</span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ padding: '0.25rem', borderRadius: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#FFFFFF' }}
            className="lg:hidden"
          >
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={navStyle}>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path) && item.path !== '/admin';

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={navItemStyle(isActive)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  }
                }}
              >
                <Icon style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                {!collapsed && <span style={{ fontWeight: '500' }}>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div style={footerStyle}>
          {!collapsed && (
            <div style={userProfileStyle}>
              <div style={userAvatarStyle}>
                {userProfile?.displayName?.[0]?.toUpperCase() || 'A'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userProfile?.displayName || 'Admin'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userProfile?.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: '0.5rem',
              width: '100%',
              color: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            <LogOut style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
            {!collapsed && <span style={{ fontWeight: '500' }}>Logout</span>}
          </button>
        </div>

        {/* Collapse Button (Desktop only) */}
        <button
          onClick={onToggleCollapse}
          style={collapseButtonStyle}
          className="hidden lg:flex"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F1F5F9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          <ChevronLeft style={{
            width: '1rem',
            height: '1rem',
            transition: 'transform 0.2s ease',
            transform: collapsed ? 'rotate(180deg)' : 'none'
          }} />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
