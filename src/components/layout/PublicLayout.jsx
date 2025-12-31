import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Calendar, Menu, X, User, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

const PublicLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#F5F7FA',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #F1F5F9',
  };

  const headerContainerStyle = {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '0 1rem',
  };

  const headerInnerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '4rem',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
  };

  const logoIconStyle = {
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: '#1E3A5F',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const logoTextStyle = {
    fontWeight: 'bold',
    fontSize: '1.25rem',
    color: '#1E3A5F',
  };

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  };

  const navLinkStyle = {
    color: '#64748B',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  };

  const authButtonsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const mobileMenuButtonStyle = {
    padding: '0.5rem',
    borderRadius: '0.5rem',
    color: '#64748B',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const mobileMenuStyle = {
    padding: '1rem 0',
    borderTop: '1px solid #F1F5F9',
  };

  const mobileNavLinkStyle = {
    display: 'block',
    padding: '0.5rem 1rem',
    color: '#64748B',
    textDecoration: 'none',
    borderRadius: '0.5rem',
  };

  const footerStyle = {
    backgroundColor: '#1E3A5F',
    color: '#FFFFFF',
    marginTop: 'auto',
  };

  const footerContainerStyle = {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '3rem 1rem',
  };

  const footerGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
  };

  const footerSectionTitleStyle = {
    fontWeight: '600',
    marginBottom: '1rem',
  };

  const footerLinkStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    display: 'block',
    marginBottom: '0.5rem',
    transition: 'color 0.2s ease',
  };

  const footerTextStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  };

  const footerBottomStyle = {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.875rem',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={headerContainerStyle}>
          <div style={headerInnerStyle}>
            {/* Logo */}
            <Link to="/" style={logoStyle}>
              <div style={logoIconStyle}>
                <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#FFFFFF' }} />
              </div>
              <span style={logoTextStyle}>Ventixe</span>
            </Link>

            {/* Desktop Navigation */}
            <nav style={navStyle} className="hidden md:flex">
              <Link to="/" style={navLinkStyle}>Home</Link>
              <Link to="/events" style={navLinkStyle}>Events</Link>
              <Link to="/about" style={navLinkStyle}>About</Link>
              <Link to="/contact" style={navLinkStyle}>Contact</Link>
            </nav>

            {/* Auth Buttons */}
            <div style={authButtonsStyle} className="hidden md:flex">
              {user ? (
                <>
                  {isAdmin && (
                    <Button variant="ghost" onClick={() => navigate('/admin')}>
                      Admin Panel
                    </Button>
                  )}
                  <Button variant="outline" icon={User} onClick={() => navigate('/profile')}>
                    Profile
                  </Button>
                  <Button variant="secondary" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="primary" icon={LogIn} onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={mobileMenuButtonStyle}
              className="md:hidden"
            >
              {menuOpen ? <X style={{ width: '1.25rem', height: '1.25rem' }} /> : <Menu style={{ width: '1.25rem', height: '1.25rem' }} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div style={mobileMenuStyle} className="md:hidden">
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/" onClick={() => setMenuOpen(false)} style={mobileNavLinkStyle}>Home</Link>
                <Link to="/events" onClick={() => setMenuOpen(false)} style={mobileNavLinkStyle}>Events</Link>
                <Link to="/about" onClick={() => setMenuOpen(false)} style={mobileNavLinkStyle}>About</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)} style={mobileNavLinkStyle}>Contact</Link>
                <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #F1F5F9' }} />
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ ...mobileNavLinkStyle, color: '#1E3A5F', fontWeight: '500' }}>
                        Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setMenuOpen(false)} style={mobileNavLinkStyle}>Profile</Link>
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      style={{ ...mobileNavLinkStyle, color: '#EF4444', textAlign: 'left', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} style={mobileNavLinkStyle}>Login</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} style={{ ...mobileNavLinkStyle, color: '#1E3A5F', fontWeight: '500' }}>
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={footerContainerStyle}>
          <div style={footerGridStyle}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ ...logoIconStyle, backgroundColor: '#E91E63' }}>
                  <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#FFFFFF' }} />
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Ventixe</span>
              </div>
              <p style={footerTextStyle}>
                Enterprise-ready event management solution for colleges, corporates, and organizations.
              </p>
            </div>

            <div>
              <h4 style={footerSectionTitleStyle}>Quick Links</h4>
              <Link to="/" style={footerLinkStyle}>Home</Link>
              <Link to="/events" style={footerLinkStyle}>Events</Link>
              <Link to="/about" style={footerLinkStyle}>About</Link>
              <Link to="/contact" style={footerLinkStyle}>Contact</Link>
            </div>

            <div>
              <h4 style={footerSectionTitleStyle}>Features</h4>
              <p style={footerTextStyle}>Event Management</p>
              <p style={footerTextStyle}>Online Registration</p>
              <p style={footerTextStyle}>QR Code Entry</p>
              <p style={footerTextStyle}>Analytics Dashboard</p>
            </div>

            <div>
              <h4 style={footerSectionTitleStyle}>Contact</h4>
              <p style={footerTextStyle}>support@ventixe.com</p>
              <p style={footerTextStyle}>+91 9876543210</p>
              <p style={footerTextStyle}>Chennai, India</p>
            </div>
          </div>

          <div style={footerBottomStyle}>
            <p>&copy; {new Date().getFullYear()} Ventixe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
