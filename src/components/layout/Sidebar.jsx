import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Mail,
  CalendarDays,
  Ticket,
  DollarSign,
  Image,
  MessageSquare,
  ChevronLeft,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/events', label: 'Events', icon: Ticket },
  { path: '/admin/participants', label: 'Bookings', icon: FileText },
  { path: '/admin/attendance', label: 'Attendance', icon: CalendarDays },
  { path: '/admin/payments', label: 'Payments', icon: DollarSign },
  { path: '/admin/analytics', label: 'Analytics', icon: Calendar },
  { path: '/admin/settings', label: 'Settings', icon: MessageSquare },
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
    backgroundColor: '#FFFFFF',
    transition: 'all 0.3s ease-in-out',
    width: collapsed ? '5rem' : '16rem',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #F1F5F9',
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
    gap: '0.75rem',
    padding: '1.5rem 1.25rem',
    borderBottom: '1px solid #F1F5F9',
  };

  const logoIconStyle = {
    width: '2.5rem',
    height: '2.5rem',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const navStyle = {
    flex: 1,
    padding: '1.5rem 1rem',
    overflowY: 'auto',
  };

  const navItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    transition: 'all 0.2s ease',
    marginBottom: '0.375rem',
    backgroundColor: isActive ? 'rgba(233, 30, 99, 0.08)' : 'transparent',
    color: isActive ? '#E91E63' : '#64748B',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.9375rem',
  });

  const footerStyle = {
    padding: '1rem',
    borderTop: '1px solid #F1F5F9',
  };

  const userProfileStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '0.75rem',
  };

  const userAvatarStyle = {
    width: '2.5rem',
    height: '2.5rem',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 0,
  };

  const collapseButtonStyle = {
    position: 'absolute',
    right: '-0.75rem',
    top: '5rem',
    width: '1.5rem',
    height: '1.5rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748B',
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <span style={{ fontWeight: '700', fontSize: '1.375rem', color: '#1E293B', letterSpacing: '-0.025em' }}>Ventixe</span>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.125rem' }}>
                Hello {userProfile?.displayName?.split(' ')[0] || 'Admin'}, welcome back!
              </p>
            </div>
          )}
          <button
            onClick={onClose}
            style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', marginLeft: 'auto' }}
            className="lg:hidden"
          >
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={navStyle}>
          {navItems.map((item) => {
            const Icon = item.icon;

            // Check if current path matches this nav item
            let isActive = false;
            if (item.exact) {
              // For Dashboard, only exact match
              isActive = location.pathname === item.path;
            } else {
              // For other items, match exact path or child paths
              isActive = location.pathname === item.path ||
                         location.pathname.startsWith(item.path + '/');
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={navItemStyle(isActive)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.color = '#1E293B';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                <Icon style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
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
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userProfile?.displayName || 'Admin'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Admin
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              width: '100%',
              color: '#EF4444',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Button (Desktop only) */}
        <button
          onClick={onToggleCollapse}
          style={collapseButtonStyle}
          className="hidden lg:flex"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F8FAFC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          <ChevronLeft style={{
            width: '0.875rem',
            height: '0.875rem',
            transition: 'transform 0.2s ease',
            transform: collapsed ? 'rotate(180deg)' : 'none'
          }} />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
