import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CHART_COLORS = ['#1E3A5F', '#E91E63', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsRef);
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const regsRef = collection(db, 'registrations');
      const regsSnapshot = await getDocs(regsRef);
      const registrations = regsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const paymentsRef = collection(db, 'payments');
      const paymentsSnapshot = await getDocs(paymentsRef);
      const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const now = new Date();
      const upcomingEvents = events.filter(e => {
        const eventDate = e.eventDate?.toDate?.() || new Date(e.eventDate);
        return eventDate > now;
      }).length;

      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        totalEvents: events.length,
        totalRegistrations: registrations.length,
        totalRevenue,
        upcomingEvents,
      });

      setRecentEvents(
        events
          .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0))
          .slice(0, 5)
      );

      setRecentRegistrations(
        registrations
          .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0))
          .slice(0, 5)
      );

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: format(date, 'MMM dd'),
          registrations: registrations.filter(r => {
            const regDate = r.createdAt?.toDate?.();
            if (!regDate) return false;
            return format(regDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          }).length,
        };
      });
      setChartData(last7Days);

      const categories = {};
      events.forEach(e => {
        const cat = e.category || 'Other';
        categories[cat] = (categories[cat] || 0) + 1;
      });
      setCategoryData(
        Object.entries(categories).map(([name, value]) => ({ name, value }))
      );

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1E3A5F',
  };

  const subtitleStyle = {
    color: '#64748B',
    fontSize: '0.875rem',
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
  };

  const statCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const statHeaderStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  };

  const statLabelStyle = {
    fontSize: '0.875rem',
    color: '#64748B',
    marginBottom: '0.5rem',
  };

  const statValueStyle = {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#1E3A5F',
  };

  const statIconStyle = (color) => ({
    padding: '0.75rem',
    borderRadius: '0.75rem',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const trendStyle = (isUp) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    color: isUp ? '#10B981' : '#EF4444',
  });

  const chartsRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const cardTitleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '0.25rem',
  };

  const cardSubtitleStyle = {
    fontSize: '0.875rem',
    color: '#64748B',
    marginBottom: '1.5rem',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    textAlign: 'left',
    paddingBottom: '0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const tdStyle = {
    padding: '0.75rem 0',
    borderTop: '1px solid #F1F5F9',
  };

  const avatarStyle = (color) => ({
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.5rem',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const userAvatarStyle = {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    backgroundColor: '#E91E63',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: '0.875rem',
    fontWeight: '500',
  };

  const statCards = [
    { title: 'Total Events', value: stats.totalEvents, icon: Calendar, change: '+12%', trend: 'up', color: '#1E3A5F' },
    { title: 'Total Registrations', value: stats.totalRegistrations, icon: Users, change: '+8%', trend: 'up', color: '#E91E63' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: CreditCard, change: '+23%', trend: 'up', color: '#10B981' },
    { title: 'Upcoming Events', value: stats.upcomingEvents, icon: TrendingUp, change: '-5%', trend: 'down', color: '#F59E0B' },
  ];

  return (
    <div style={containerStyle}>
      {/* Page Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Dashboard</h1>
          <p style={subtitleStyle}>Welcome back! Here's what's happening.</p>
        </div>
        <Link to="/admin/events/create">
          <Button variant="primary" icon={Plus}>Create Event</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={statsGridStyle}>
        {statCards.map((stat, index) => (
          <div key={index} style={statCardStyle}>
            <div style={statHeaderStyle}>
              <div>
                <p style={statLabelStyle}>{stat.title}</p>
                <p style={statValueStyle}>{stat.value}</p>
                <div style={trendStyle(stat.trend === 'up')}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                  ) : (
                    <ArrowDownRight style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                  )}
                  {stat.change} from last month
                </div>
              </div>
              <div style={statIconStyle(stat.color)}>
                <stat.icon style={{ width: '1.5rem', height: '1.5rem', color: '#FFFFFF' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={chartsRowStyle}>
        {/* Registrations Chart */}
        <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
          <h2 style={cardTitleStyle}>Registrations Overview</h2>
          <p style={cardSubtitleStyle}>Last 7 days</p>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#1E3A5F"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRegistrations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Event Categories</h2>
          <p style={cardSubtitleStyle}>Distribution</p>
          <div style={{ height: '280px' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
                No data available
              </div>
            )}
          </div>
          {categoryData.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              {categoryData.map((cat, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span style={{ color: '#64748B' }}>{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div style={chartsRowStyle}>
        {/* Recent Events */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={cardTitleStyle}>Recent Events</h2>
            <Link to="/admin/events">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Event</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td style={tdStyle} colSpan={4}>
                        <div style={{ height: '1rem', backgroundColor: '#E5E7EB', borderRadius: '0.25rem' }} />
                      </td>
                    </tr>
                  ))
                ) : recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <tr key={event.id}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={avatarStyle('rgba(30, 58, 95, 0.1)')}>
                            <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#1E3A5F' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '500', color: '#1E3A5F', fontSize: '0.875rem' }}>
                              {event.title?.substring(0, 20)}{event.title?.length > 20 ? '...' : ''}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{event.category}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '0.875rem', color: '#64748B' }}>
                        {formatDate(event.eventDate)}
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={event.status || 'draft'} />
                      </td>
                      <td style={tdStyle}>
                        <Link to={`/admin/events/${event.id}/edit`}>
                          <button style={{ padding: '0.25rem', borderRadius: '0.25rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <Eye style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#64748B', padding: '2rem 0' }}>
                      No events yet. Create your first event!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={cardTitleStyle}>Recent Registrations</h2>
            <Link to="/admin/participants">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Participant</th>
                  <th style={thStyle}>Event</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td style={tdStyle} colSpan={3}>
                        <div style={{ height: '1rem', backgroundColor: '#E5E7EB', borderRadius: '0.25rem' }} />
                      </td>
                    </tr>
                  ))
                ) : recentRegistrations.length > 0 ? (
                  recentRegistrations.map((reg) => (
                    <tr key={reg.id}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={userAvatarStyle}>
                            {reg.fullName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p style={{ fontWeight: '500', color: '#1E3A5F', fontSize: '0.875rem' }}>
                              {reg.fullName}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{reg.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '0.875rem', color: '#64748B', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {reg.eventTitle}
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={reg.paymentStatus || 'pending'} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#64748B', padding: '2rem 0' }}>
                      No registrations yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
