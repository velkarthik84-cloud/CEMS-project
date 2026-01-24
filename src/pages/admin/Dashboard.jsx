import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Building2,
  Plus,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalDepartments: 0,
    todayRegistrations: 0,
    todayAddedEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all events
      const eventsRef = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsRef);
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch all departments
      const deptRef = collection(db, 'departments');
      const deptSnapshot = await getDocs(deptRef);

      // Fetch all registrations
      const regsRef = collection(db, 'registrations');
      const regsSnapshot = await getDocs(regsRef);
      const registrations = regsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count today's registrations
      const todayRegs = registrations.filter(reg => {
        if (!reg.createdAt) return false;
        const regDate = reg.createdAt.toDate ? reg.createdAt.toDate() : new Date(reg.createdAt);
        return regDate >= today;
      });

      // Count today's added events
      const todayEvents = events.filter(event => {
        if (!event.createdAt) return false;
        const eventCreated = event.createdAt.toDate ? event.createdAt.toDate() : new Date(event.createdAt);
        return eventCreated >= today;
      });

      setStats({
        totalEvents: events.length,
        totalDepartments: deptSnapshot.docs.length,
        todayRegistrations: todayRegs.length,
        todayAddedEvents: todayEvents.length,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const iconContainerStyle = (bgColor) => ({
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '1rem',
    backgroundColor: bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid #E2E8F0',
          borderTopColor: '#E91E63',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
          Welcome back! Here's an overview of your event management system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1.5rem' }}>
        {/* Total Events Card */}
        <div style={cardStyle}>
          <div style={iconContainerStyle('rgba(139, 92, 246, 0.1)')}>
            <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#8B5CF6' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Total Events</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{stats.totalEvents}</p>
          </div>
        </div>

        {/* Total Departments Card */}
        <div style={cardStyle}>
          <div style={iconContainerStyle('rgba(233, 30, 99, 0.1)')}>
            <Building2 style={{ width: '1.5rem', height: '1.5rem', color: '#E91E63' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Total Departments</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{stats.totalDepartments}</p>
          </div>
        </div>

        {/* Today's Registrations Card */}
        <div style={cardStyle}>
          <div style={iconContainerStyle('rgba(16, 185, 129, 0.1)')}>
            <Users style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Today's Registrations</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{stats.todayRegistrations}</p>
          </div>
        </div>

        {/* Today's Added Events Card */}
        <div style={cardStyle}>
          <div style={iconContainerStyle('rgba(245, 158, 11, 0.1)')}>
            <Plus style={{ width: '1.5rem', height: '1.5rem', color: '#F59E0B' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Today's Added Events</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{stats.todayAddedEvents}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
