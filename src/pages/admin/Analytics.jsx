import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
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
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { CHART_COLORS, EVENT_CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    avgAttendance: 0,
  });
  const [registrationData, setRegistrationData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [eventTypeData, setEventTypeData] = useState([]);
  const [topEvents, setTopEvents] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const [eventsSnap, regsSnap, paymentsSnap] = await Promise.all([
        getDocs(collection(db, 'events')),
        getDocs(collection(db, 'registrations')),
        getDocs(collection(db, 'payments')),
      ]);

      const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const registrations = regsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const attendedCount = registrations.filter(r => r.attendanceStatus === 'checked_in').length;
      const avgAttendance = registrations.length > 0
        ? Math.round((attendedCount / registrations.length) * 100)
        : 0;

      setStats({
        totalEvents: events.length,
        totalRegistrations: registrations.length,
        totalRevenue,
        avgAttendance,
      });

      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
      const dateRange = eachDayOfInterval({
        start: subDays(new Date(), days - 1),
        end: new Date(),
      });

      const regData = dateRange.map(date => {
        const dayRegs = registrations.filter(r => {
          const regDate = r.createdAt?.toDate?.();
          return regDate && format(regDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });
        return {
          date: format(date, 'MMM dd'),
          registrations: dayRegs.length,
        };
      });
      setRegistrationData(regData);

      const revData = dateRange.map(date => {
        const dayPayments = payments.filter(p => {
          const payDate = p.createdAt?.toDate?.();
          return payDate &&
            p.status === 'completed' &&
            format(payDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });
        return {
          date: format(date, 'MMM dd'),
          revenue: dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        };
      });
      setRevenueData(revData);

      const categories = {};
      events.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + 1;
      });
      setCategoryData(
        Object.entries(categories).map(([name, value]) => ({
          name: EVENT_CATEGORIES.find(c => c.value === name)?.label || name,
          value,
        }))
      );

      const types = { online: 0, offline: 0 };
      events.forEach(e => {
        types[e.type] = (types[e.type] || 0) + 1;
      });
      setEventTypeData([
        { name: 'Online', value: types.online },
        { name: 'Offline', value: types.offline },
      ]);

      const eventRegs = events.map(e => ({
        ...e,
        registrations: registrations.filter(r => r.eventId === e.id).length,
        revenue: payments
          .filter(p => p.eventId === e.id && p.status === 'completed')
          .reduce((sum, p) => sum + (p.amount || 0), 0),
      }));
      setTopEvents(
        eventRegs
          .sort((a, b) => b.registrations - a.registrations)
          .slice(0, 5)
      );

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.875rem',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  const selectStyle = {
    padding: '0.625rem 2rem 0.625rem 1rem',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#1E293B',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    minWidth: '140px',
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    backgroundColor: '#FFFFFF',
    color: '#64748B',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  };

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      change: '+12%',
      trend: 'up',
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
    },
    {
      title: 'Registrations',
      value: stats.totalRegistrations,
      icon: Users,
      change: '+8%',
      trend: 'up',
      color: '#E91E63',
      bgColor: 'rgba(233, 30, 99, 0.1)',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      change: '+23%',
      trend: 'up',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Avg. Attendance',
      value: `${stats.avgAttendance}%`,
      icon: TrendingUp,
      change: '-5%',
      trend: 'down',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Track performance and insights
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={selectStyle}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <ChevronDown style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1rem',
              height: '1rem',
              color: '#94A3B8',
              pointerEvents: 'none',
            }} />
          </div>
          <button style={buttonStyle}>
            <Download style={{ width: '1rem', height: '1rem' }} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1.25rem' }}>
        {statCards.map((stat, index) => (
          <div key={index} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.25rem' }}>{stat.title}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{stat.value}</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '0.5rem',
                  fontSize: '0.8125rem',
                  color: stat.trend === 'up' ? '#10B981' : '#EF4444',
                }}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                  ) : (
                    <ArrowDownRight style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                  )}
                  {stat.change} from last period
                </div>
              </div>
              <div style={{
                width: '2.75rem',
                height: '2.75rem',
                borderRadius: '0.75rem',
                backgroundColor: stat.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <stat.icon style={{ width: '1.25rem', height: '1.25rem', color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '1.5rem' }}>
        {/* Registration Trend */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>
            Registration Trend
          </h2>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationData}>
                <defs>
                  <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#colorRegs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trend */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>
            Revenue Trend
          </h2>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E91E63"
                  strokeWidth={2}
                  dot={{ fill: '#E91E63' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
        {/* Category Distribution */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>
            Events by Category
          </h2>
          <div style={{ height: '250px' }}>
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Type Distribution */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>
            Online vs Offline
          </h2>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Events */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>
            Top Events
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topEvents.map((event, index) => (
              <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.5rem',
                  backgroundColor: index === 0 ? '#E91E63' : index === 1 ? '#8B5CF6' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                }}>
                  {index + 1}
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
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                    {event.registrations} registrations
                  </p>
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                  ₹{event.revenue.toLocaleString()}
                </p>
              </div>
            ))}
            {topEvents.length === 0 && (
              <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>
                No events yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
