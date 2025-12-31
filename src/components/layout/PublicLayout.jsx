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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-text-primary">Ventixe</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-text-secondary hover:text-primary transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/events"
                className="text-text-secondary hover:text-primary transition-colors font-medium"
              >
                Events
              </Link>
              <Link
                to="/about"
                className="text-text-secondary hover:text-primary transition-colors font-medium"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-text-secondary hover:text-primary transition-colors font-medium"
              >
                Contact
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/admin')}
                    >
                      Admin Panel
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    icon={User}
                    onClick={() => navigate('/profile')}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    icon={LogIn}
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-gray-100"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-text-secondary hover:bg-gray-50 rounded-lg"
                >
                  Home
                </Link>
                <Link
                  to="/events"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-text-secondary hover:bg-gray-50 rounded-lg"
                >
                  Events
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-text-secondary hover:bg-gray-50 rounded-lg"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-text-secondary hover:bg-gray-50 rounded-lg"
                >
                  Contact
                </Link>
                <hr className="my-2 border-gray-100" />
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="px-4 py-2 text-primary hover:bg-gray-50 rounded-lg font-medium"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2 text-text-secondary hover:bg-gray-50 rounded-lg"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="px-4 py-2 text-error hover:bg-gray-50 rounded-lg text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2 text-text-secondary hover:bg-gray-50 rounded-lg"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2 text-primary hover:bg-gray-50 rounded-lg font-medium"
                    >
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
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">Ventixe</span>
              </div>
              <p className="text-white/70 text-sm">
                Enterprise-ready event management solution for colleges, corporates, and organizations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>Event Management</li>
                <li>Online Registration</li>
                <li>QR Code Entry</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>support@ventixe.com</li>
                <li>+91 9876543210</li>
                <li>Chennai, India</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/50 text-sm">
            <p>&copy; {new Date().getFullYear()} Ventixe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
