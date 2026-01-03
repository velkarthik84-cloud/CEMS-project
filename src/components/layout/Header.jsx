import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/events': 'Events',
  '/admin/events/create': 'Create Event',
  '/admin/participants': 'Bookings',
  '/admin/attendance': 'Attendance',
  '/admin/payments': 'Payments',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

const Header = ({ onMenuClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Get page title based on current path
  const getPageTitle = () => {
    // Check for exact match first
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    // Check for partial match (for nested routes)
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path + '/')) {
        return title;
      }
    }
    return 'Dashboard';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      padding: '1rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
      }}>
        {/* Left side - Menu button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onMenuClick}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: '#64748B',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            className="lg:hidden"
          >
            <Menu style={{ width: '1.5rem', height: '1.5rem' }} />
          </button>

          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1E293B',
            margin: 0,
          }}>
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Icons & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {showSearch && (
              <div style={{
                position: 'absolute',
                right: '2.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search anything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSearch(false);
                      setSearchTerm('');
                    }
                  }}
                  style={{
                    width: '280px',
                    padding: '0.625rem 1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
            )}
            <button
              onClick={() => setShowSearch(!showSearch)}
              style={{
                padding: '0.625rem',
                borderRadius: '0.5rem',
                color: showSearch ? '#E91E63' : '#64748B',
                backgroundColor: showSearch ? 'rgba(233, 30, 99, 0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Search style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                padding: '0.625rem',
                borderRadius: '0.5rem',
                color: '#64748B',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{
                position: 'absolute',
                top: '0.375rem',
                right: '0.375rem',
                width: '0.5rem',
                height: '0.5rem',
                backgroundColor: '#E91E63',
                borderRadius: '50%',
                border: '2px solid #FFFFFF',
              }} />
            </button>

            {showNotifications && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setShowNotifications(false)}
                />
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '0.5rem',
                  width: '20rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  border: '1px solid #E2E8F0',
                  zIndex: 50,
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                    <h3 style={{ fontWeight: '600', color: '#1E293B' }}>Notifications</h3>
                  </div>
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8' }}>
                    No new notifications
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <button
            style={{
              padding: '0.625rem',
              borderRadius: '0.5rem',
              color: '#64748B',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Settings style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>

          {/* User Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.375rem 0.5rem',
                borderRadius: '0.75rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '2.25rem',
                height: '2.25rem',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '600' }}>
                    {userProfile?.displayName?.[0]?.toUpperCase() || 'A'}
                  </span>
                )}
              </div>
              <div className="hidden sm:block" style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                  {userProfile?.displayName || 'Admin'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                  Admin
                </p>
              </div>
              <ChevronDown style={{ width: '1rem', height: '1rem', color: '#94A3B8' }} className="hidden sm:block" />
            </button>

            {showDropdown && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setShowDropdown(false)}
                />
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '0.5rem',
                  width: '12rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  border: '1px solid #E2E8F0',
                  zIndex: 50,
                  padding: '0.5rem',
                }}>
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.5rem',
                      color: '#475569',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                    }}
                  >
                    <User style={{ width: '1rem', height: '1rem' }} />
                    Profile
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.5rem',
                      color: '#475569',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                    }}
                  >
                    <Settings style={{ width: '1rem', height: '1rem' }} />
                    Settings
                  </Link>
                  <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #F1F5F9' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.5rem',
                      color: '#EF4444',
                      backgroundColor: 'transparent',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    <LogOut style={{ width: '1rem', height: '1rem' }} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
