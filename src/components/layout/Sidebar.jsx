import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CalendarDays,
  Ticket,
  ChevronLeft,
  X,
  Award,
  Building2,
  ClipboardList,
  Trophy,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/events', label: 'Events', icon: Ticket },
  { path: '/admin/departments', label: 'Departments', icon: Building2 },
  { path: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
  { path: '/admin/participants', label: 'Participants', icon: FileText },
  { path: '/admin/attendance', label: 'Attendance', icon: CalendarDays },
  { path: '/admin/winners', label: 'Winners', icon: Trophy },
  { path: '/admin/certificates', label: 'Certificates', icon: Award },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const { userProfile } = useAuth();

  return (
    <>
      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          height: 100%;
          background-color: #FFFFFF;
          transition: all 0.3s ease-in-out;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #F1F5F9;
          transform: translateX(-100%);
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar.collapsed {
          width: 5rem;
        }

        .sidebar:not(.collapsed) {
          width: 16rem;
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 40;
          display: none;
        }

        .sidebar-overlay.active {
          display: block;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1rem;
          border-bottom: 1px solid #F1F5F9;
        }

        .sidebar-logo-icon {
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-close-btn {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background-color: transparent;
          border: none;
          cursor: pointer;
          color: #64748B;
          margin-left: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          overflow-y: auto;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          transition: all 0.2s ease;
          margin-bottom: 0.25rem;
          text-decoration: none;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .sidebar-nav-item.active {
          background-color: rgba(233, 30, 99, 0.08);
          color: #E91E63;
          font-weight: 600;
        }

        .sidebar-nav-item:not(.active) {
          background-color: transparent;
          color: #64748B;
        }

        .sidebar-nav-item:not(.active):hover {
          background-color: #F8FAFC;
          color: #1E293B;
        }

        .sidebar-collapse-btn {
          position: absolute;
          right: -0.75rem;
          top: 5rem;
          width: 1.5rem;
          height: 1.5rem;
          background-color: #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          display: none;
          align-items: center;
          justify-content: center;
          color: #64748B;
          border: 1px solid #E2E8F0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-collapse-btn:hover {
          background-color: #F8FAFC;
        }

        /* Desktop styles */
        @media (min-width: 1024px) {
          .sidebar {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: none !important;
          }

          .sidebar-close-btn {
            display: none;
          }

          .sidebar-collapse-btn {
            display: flex;
          }

          .sidebar-logo {
            padding: 1.5rem 1.25rem;
          }

          .sidebar-nav {
            padding: 1.5rem 1rem;
          }

          .sidebar-nav-item {
            padding: 0.875rem 1rem;
            font-size: 0.9375rem;
          }
        }
      `}</style>

      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <span style={{ fontWeight: '700', fontSize: '1.375rem', color: '#1E293B', letterSpacing: '-0.025em' }}>Ventixe</span>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Hello {userProfile?.displayName?.split(' ')[0] || 'Admin'}!
              </p>
            </div>
          )}
          <button onClick={onClose} className="sidebar-close-btn">
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Button (Desktop only) */}
        <button onClick={onToggleCollapse} className="sidebar-collapse-btn">
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
