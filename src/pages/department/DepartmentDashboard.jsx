import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Calendar,
  Users,
  Trophy,
  Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import { format } from 'date-fns';

const DepartmentDashboard = () => {
  const { departmentSession } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    pendingRegistrations: 0,
    approvedRegistrations: 0,
    rejectedRegistrations: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    winnersCount: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    if (!departmentSession?.departmentId) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch registrations for this department
        const registrationsRef = collection(db, 'registrations');
        const regQuery = query(
          registrationsRef,
          where('departmentId', '==', departmentSession.departmentId)
        );
        const regSnapshot = await getDocs(regQuery);
        const registrations = regSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate registration stats
        const pending = registrations.filter(r => r.status === 'pending').length;
        const approved = registrations.filter(r => r.status === 'approved').length;
        const rejected = registrations.filter(r => r.status === 'rejected').length;

        // Fetch events
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(eventsRef, where('status', '==', 'published'));
        const eventsSnapshot = await getDocs(eventsQuery);
        const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter upcoming events
        const now = new Date();
        const upcoming = events.filter(e => {
          const eventDate = e.eventDate?.toDate ? e.eventDate.toDate() : new Date(e.eventDate);
          return eventDate >= now;
        }).sort((a, b) => {
          const dateA = a.eventDate?.toDate ? a.eventDate.toDate() : new Date(a.eventDate);
          const dateB = b.eventDate?.toDate ? b.eventDate.toDate() : new Date(b.eventDate);
          return dateA - dateB;
        });

        // Fetch winners for this department
        const winnersRef = collection(db, 'winners');
        const winnersQuery = query(
          winnersRef,
          where('departmentId', '==', departmentSession.departmentId)
        );
        const winnersSnapshot = await getDocs(winnersQuery);

        setStats({
          totalRegistrations: registrations.length,
          pendingRegistrations: pending,
          approvedRegistrations: approved,
          rejectedRegistrations: rejected,
          totalEvents: events.length,
          upcomingEvents: upcoming.length,
          winnersCount: winnersSnapshot.docs.length,
        });

        // Get recent registrations (last 5)
        setRecentRegistrations(registrations.slice(-5).reverse());

        // Get upcoming events (next 5)
        setUpcomingEvents(upcoming.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time listener for live events
    const eventsRef = collection(db, 'events');
    const liveQuery = query(eventsRef, where('status', '==', 'published'));
    const unsubscribe = onSnapshot(liveQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const now = new Date();
      const live = events.filter(e => {
        const eventDate = e.eventDate?.toDate ? e.eventDate.toDate() : new Date(e.eventDate);
        const startTime = e.startTime;
        const endTime = e.endTime;
        // Simple check - event is on today
        return eventDate.toDateString() === now.toDateString();
      });
      setLiveEvents(live);
    });

    return () => unsubscribe();
  }, [departmentSession]);

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const statCardStyle = (color) => ({
    ...cardStyle,
    borderLeft: `4px solid ${color}`,
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
      {/* Welcome Section */}
      <div style={{
        ...cardStyle,
        background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%)',
        color: '#FFFFFF',
        marginBottom: '1.5rem',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
          Welcome, {departmentSession.departmentName}!
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0 }}>
          Manage your event registrations and track live scores from your department dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={statCardStyle('#3B82F6')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users style={{ width: '1.5rem', height: '1.5rem', color: '#3B82F6' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>
                Total Registrations
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                {stats.totalRegistrations}
              </p>
            </div>
          </div>
        </div>

        <div style={statCardStyle('#F59E0B')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#F59E0B' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>
                Pending Approval
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                {stats.pendingRegistrations}
              </p>
            </div>
          </div>
        </div>

        <div style={statCardStyle('#10B981')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>
                Approved
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                {stats.approvedRegistrations}
              </p>
            </div>
          </div>
        </div>

        <div style={statCardStyle('#E91E63')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(233, 30, 99, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Trophy style={{ width: '1.5rem', height: '1.5rem', color: '#E91E63' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>
                Winners
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                {stats.winnersCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Live Events */}
        {liveEvents.length > 0 && (
          <div style={{
            ...cardStyle,
            gridColumn: '1 / -1',
            border: '2px solid #E91E63',
            background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, #FFFFFF 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                animation: 'pulse 2s infinite',
              }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                Live Events Today
              </h3>
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {liveEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/department/live-scores?eventId=${event.id}`}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.75rem',
                    border: '1px solid #E2E8F0',
                    textDecoration: 'none',
                    minWidth: '200px',
                    flex: '1',
                    maxWidth: '300px',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
                    {event.title}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                    {event.startTime} - {event.endTime}
                  </p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    borderRadius: '0.25rem',
                  }}>
                    <TrendingUp style={{ width: '0.75rem', height: '0.75rem', color: '#E91E63' }} />
                    <span style={{ fontSize: '0.6875rem', color: '#E91E63', fontWeight: '500' }}>View Live Scores</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
              Upcoming Events
            </h3>
            <Link
              to="/department/events"
              style={{
                fontSize: '0.75rem',
                color: '#E91E63',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View All <ChevronRight style={{ width: '0.875rem', height: '0.875rem' }} />
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: '#64748B', textAlign: 'center', padding: '2rem 0' }}>
              No upcoming events
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingEvents.map((event) => {
                const eventDate = event.eventDate?.toDate ? event.eventDate.toDate() : new Date(event.eventDate);
                return (
                  <Link
                    key={event.id}
                    to={`/department/events?eventId=${event.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.5rem',
                      backgroundColor: '#1E3A5F',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                    }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '700', lineHeight: 1 }}>
                        {format(eventDate, 'dd')}
                      </span>
                      <span style={{ fontSize: '0.625rem', textTransform: 'uppercase' }}>
                        {format(eventDate, 'MMM')}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1E293B',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {event.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                        {event.category} | {event.startTime}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
              Recent Registrations
            </h3>
            <Link
              to="/department/registrations"
              style={{
                fontSize: '0.75rem',
                color: '#E91E63',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View All <ChevronRight style={{ width: '0.875rem', height: '0.875rem' }} />
            </Link>
          </div>
          {recentRegistrations.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: '#64748B', textAlign: 'center', padding: '2rem 0' }}>
              No registrations yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentRegistrations.map((reg) => {
                const statusColors = {
                  pending: { bg: '#FEF3C7', color: '#D97706' },
                  approved: { bg: '#D1FAE5', color: '#059669' },
                  rejected: { bg: '#FEE2E2', color: '#DC2626' },
                };
                const status = statusColors[reg.status] || statusColors.pending;
                return (
                  <div
                    key={reg.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '0.5rem',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1E293B',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {reg.studentName || reg.fullName}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                        {reg.eventTitle}
                      </p>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: '500',
                      backgroundColor: status.bg,
                      color: status.color,
                      textTransform: 'capitalize',
                    }}>
                      {reg.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 1rem 0' }}>
          Quick Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
        }}>
          <Link
            to="/department/events"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              border: '1px solid #E2E8F0',
              transition: 'all 0.2s',
            }}
          >
            <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#1E3A5F' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#1E293B' }}>View Events</span>
          </Link>
          <Link
            to="/department/register"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              border: '1px solid #E2E8F0',
              transition: 'all 0.2s',
            }}
          >
            <Users style={{ width: '1.5rem', height: '1.5rem', color: '#E91E63' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#1E293B' }}>Register Students</span>
          </Link>
          <Link
            to="/department/live-scores"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              border: '1px solid #E2E8F0',
              transition: 'all 0.2s',
            }}
          >
            <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#1E293B' }}>Live Scores</span>
          </Link>
          <Link
            to="/department/certificates"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              border: '1px solid #E2E8F0',
              transition: 'all 0.2s',
            }}
          >
            <Award style={{ width: '1.5rem', height: '1.5rem', color: '#F59E0B' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#1E293B' }}>Certificates</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
