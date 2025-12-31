import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick, title }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #F1F5F9',
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '4rem',
    padding: '0 1rem',
  };

  const leftSideStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const menuButtonStyle = {
    padding: '0.5rem',
    borderRadius: '0.5rem',
    color: '#64748B',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1E3A5F',
  };

  const searchContainerStyle = {
    flex: 1,
    maxWidth: '28rem',
    margin: '0 1rem',
    position: 'relative',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '0.5rem 1rem 0.5rem 2.5rem',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
  };

  const rightSideStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const iconButtonStyle = {
    position: 'relative',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    color: '#64748B',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const notificationDotStyle = {
    position: 'absolute',
    top: '0.25rem',
    right: '0.25rem',
    width: '0.5rem',
    height: '0.5rem',
    backgroundColor: '#E91E63',
    borderRadius: '50%',
  };

  const userButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const avatarStyle = {
    width: '2rem',
    height: '2rem',
    backgroundColor: '#1E3A5F',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const dropdownStyle = {
    position: 'absolute',
    right: 0,
    marginTop: '0.5rem',
    width: '12rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid #F1F5F9',
    zIndex: 50,
    padding: '0.25rem 0',
  };

  const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    color: '#1E3A5F',
    textDecoration: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 40,
  };

  const notificationDropdownStyle = {
    position: 'absolute',
    right: 0,
    marginTop: '0.5rem',
    width: '20rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid #F1F5F9',
    zIndex: 50,
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        {/* Left side */}
        <div style={leftSideStyle}>
          <button
            onClick={onMenuClick}
            style={menuButtonStyle}
            className="lg:hidden"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>

          {title && (
            <h1 style={titleStyle} className="hidden sm:block">
              {title}
            </h1>
          )}
        </div>

        {/* Search Bar */}
        <div style={searchContainerStyle} className="hidden md:flex">
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#64748B' }} />
          <input
            type="text"
            placeholder="Search anything..."
            style={searchInputStyle}
          />
        </div>

        {/* Right side */}
        <div style={rightSideStyle}>
          {/* Mobile Search */}
          <button style={iconButtonStyle} className="md:hidden">
            <Search style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={iconButtonStyle}
            >
              <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={notificationDotStyle} />
            </button>

            {showNotifications && (
              <>
                <div style={overlayStyle} onClick={() => setShowNotifications(false)} />
                <div style={notificationDropdownStyle}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                    <h3 style={{ fontWeight: '600', color: '#1E3A5F' }}>Notifications</h3>
                  </div>
                  <div style={{ maxHeight: '18rem', overflow: 'auto' }}>
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                      No new notifications
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={userButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={avatarStyle}>
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500' }}>
                    {userProfile?.displayName?.[0]?.toUpperCase() || 'A'}
                  </span>
                )}
              </div>
              <div className="hidden sm:block" style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E3A5F' }}>
                  {userProfile?.displayName || 'Admin'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {userProfile?.role || 'admin'}
                </p>
              </div>
              <ChevronDown style={{ width: '1rem', height: '1rem', color: '#64748B' }} className="hidden sm:block" />
            </button>

            {showDropdown && (
              <>
                <div style={overlayStyle} onClick={() => setShowDropdown(false)} />
                <div style={dropdownStyle}>
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowDropdown(false)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User style={{ width: '1rem', height: '1rem' }} />
                    Profile
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowDropdown(false)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Settings style={{ width: '1rem', height: '1rem' }} />
                    Settings
                  </Link>
                  <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: '1px solid #F1F5F9' }} />
                  <button
                    onClick={handleLogout}
                    style={{ ...dropdownItemStyle, color: '#EF4444' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
