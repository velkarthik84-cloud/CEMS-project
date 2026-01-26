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
     

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      
    </div>
  );
};

export default PublicLayout;
