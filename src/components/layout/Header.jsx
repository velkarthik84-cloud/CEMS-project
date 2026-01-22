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
  '/admin/departments': 'Departments',
  '/admin/registrations': 'Registrations',
  '/admin/participants': 'Participants',
  '/admin/attendance': 'Attendance',
  '/admin/winners': 'Winners',
  '/admin/certificates': 'Certificates',
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

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const getPageTitle = () => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
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
    <>
      <style>{`
        .header {
          background-color: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          padding: 0.875rem 1rem;
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .header-menu-btn {
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: #64748B;
          background-color: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .header-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1E293B;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .header-icon-btn {
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: #64748B;
          background-color: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon-btn:hover {
          background-color: #F8FAFC;
        }

        .header-icon-btn.active {
          color: #E91E63;
          background-color: rgba(233, 30, 99, 0.1);
        }

        .header-notification-dot {
          position: absolute;
          top: 0.375rem;
          right: 0.375rem;
          width: 0.5rem;
          height: 0.5rem;
          background-color: #E91E63;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
        }

        .header-search-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .header-search-input-wrapper {
          position: fixed;
          left: 1rem;
          right: 1rem;
          top: 4.5rem;
          display: flex;
          align-items: center;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }

        .header-search-input {
          flex: 1;
          padding: 0.75rem 1rem;
          background-color: transparent;
          border: none;
          font-size: 0.9375rem;
          color: #1E293B;
          outline: none;
        }

        .header-search-close {
          padding: 0.5rem;
          background-color: transparent;
          border: none;
          cursor: pointer;
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-user-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem;
          border-radius: 0.75rem;
          background-color: transparent;
          border: none;
          cursor: pointer;
        }

        .header-user-avatar {
          width: 2rem;
          height: 2rem;
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .header-user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .header-user-avatar span {
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .header-user-info {
          display: none;
          text-align: left;
        }

        .header-user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1E293B;
          margin: 0;
        }

        .header-user-role {
          font-size: 0.75rem;
          color: #94A3B8;
          margin: 0;
        }

        .header-dropdown-overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
        }

        .header-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.5rem;
          background-color: #FFFFFF;
          border-radius: 0.75rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
          border: 1px solid #E2E8F0;
          z-index: 50;
          padding: 0.5rem;
          min-width: 12rem;
        }

        .header-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border-radius: 0.5rem;
          color: #475569;
          text-decoration: none;
          font-size: 0.875rem;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
        }

        .header-dropdown-item:hover {
          background-color: #F8FAFC;
        }

        .header-dropdown-item.danger {
          color: #EF4444;
        }

        .header-dropdown-divider {
          margin: 0.5rem 0;
          border: none;
          border-top: 1px solid #F1F5F9;
        }

        .header-notifications-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.5rem;
          width: 18rem;
          background-color: #FFFFFF;
          border-radius: 0.75rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
          border: 1px solid #E2E8F0;
          z-index: 50;
        }

        /* Tablet and Desktop */
        @media (min-width: 640px) {
          .header {
            padding: 1rem 1.5rem;
          }

          .header-container {
            gap: 1rem;
          }

          .header-title {
            font-size: 1.25rem;
          }

          .header-right {
            gap: 0.5rem;
          }

          .header-icon-btn {
            padding: 0.625rem;
          }

          .header-search-input-wrapper {
            position: absolute;
            right: 2.5rem;
            left: auto;
            top: 50%;
            transform: translateY(-50%);
            width: 280px;
          }

          .header-user-avatar {
            width: 2.25rem;
            height: 2.25rem;
          }

          .header-user-info {
            display: block;
          }

          .header-notifications-dropdown {
            width: 20rem;
          }
        }

        @media (min-width: 1024px) {
          .header-menu-btn {
            display: none;
          }

          .header-title {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <header className="header">
        <div className="header-container">
          {/* Left side */}
          <div className="header-left">
            <button onClick={onMenuClick} className="header-menu-btn">
              <Menu style={{ width: '1.5rem', height: '1.5rem' }} />
            </button>
            <h1 className="header-title">{getPageTitle()}</h1>
          </div>

          {/* Right side */}
          <div className="header-right">
            {/* Search */}
            <div className="header-search-container">
              {showSearch && (
                <div className="header-search-input-wrapper">
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
                    className="header-search-input"
                  />
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchTerm('');
                    }}
                    className="header-search-close"
                  >
                    <X style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`header-icon-btn ${showSearch ? 'active' : ''}`}
              >
                <Search style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="header-icon-btn"
              >
                <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
                <span className="header-notification-dot" />
              </button>

              {showNotifications && (
                <>
                  <div className="header-dropdown-overlay" onClick={() => setShowNotifications(false)} />
                  <div className="header-notifications-dropdown">
                    <div style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                      <h3 style={{ fontWeight: '600', color: '#1E293B', margin: 0 }}>Notifications</h3>
                    </div>
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>
                      No new notifications
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings - Hidden on mobile */}
            <button className="header-icon-btn" style={{ display: 'none' }}>
              <Settings style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>

            {/* User Menu */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowDropdown(!showDropdown)} className="header-user-btn">
                <div className="header-user-avatar">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profile" />
                  ) : (
                    <span>{userProfile?.displayName?.[0]?.toUpperCase() || 'A'}</span>
                  )}
                </div>
                <div className="header-user-info">
                  <p className="header-user-name">{userProfile?.displayName || 'Admin'}</p>
                  <p className="header-user-role">Admin</p>
                </div>
                <ChevronDown style={{ width: '1rem', height: '1rem', color: '#94A3B8' }} className="header-user-info" />
              </button>

              {showDropdown && (
                <>
                  <div className="header-dropdown-overlay" onClick={() => setShowDropdown(false)} />
                  <div className="header-dropdown">
                    <Link to="/admin/settings" onClick={() => setShowDropdown(false)} className="header-dropdown-item">
                      <User style={{ width: '1rem', height: '1rem' }} />
                      Profile
                    </Link>
                    <Link to="/admin/settings" onClick={() => setShowDropdown(false)} className="header-dropdown-item">
                      <Settings style={{ width: '1rem', height: '1rem' }} />
                      Settings
                    </Link>
                    <hr className="header-dropdown-divider" />
                    <button onClick={handleLogout} className="header-dropdown-item danger">
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
    </>
  );
};

export default Header;
