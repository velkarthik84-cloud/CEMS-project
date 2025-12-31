import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Button, Card, Select } from '../../components/common';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
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

      // Fetch all data
      const [eventsSnap, regsSnap, paymentsSnap] = await Promise.all([
        getDocs(collection(db, 'events')),
        getDocs(collection(db, 'registrations')),
        getDocs(collection(db, 'payments')),
      ]);

      const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const registrations = regsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate overall stats
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

      // Generate time-based data
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
      const dateRange = eachDayOfInterval({
        start: subDays(new Date(), days - 1),
        end: new Date(),
      });

      // Registration data over time
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

      // Revenue data over time
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

      // Category distribution
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

      // Event type distribution
      const types = { online: 0, offline: 0 };
      events.forEach(e => {
        types[e.type] = (types[e.type] || 0) + 1;
      });
      setEventTypeData([
        { name: 'Online', value: types.online },
        { name: 'Offline', value: types.offline },
      ]);

      // Top events by registrations
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

  const timeRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
  ];

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      change: '+12%',
      trend: 'up',
      color: 'bg-primary',
    },
    {
      title: 'Registrations',
      value: stats.totalRegistrations,
      icon: Users,
      change: '+8%',
      trend: 'up',
      color: 'bg-accent',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      change: '+23%',
      trend: 'up',
      color: 'bg-success',
    },
    {
      title: 'Avg. Attendance',
      value: `${stats.avgAttendance}%`,
      icon: TrendingUp,
      change: '-5%',
      trend: 'down',
      color: 'bg-warning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary">Track performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" icon={Download}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <div className={`flex items-center mt-2 text-sm ${
                  stat.trend === 'up' ? 'text-success' : 'text-error'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {stat.change} from last period
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Registration Trend
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationData}>
                <defs>
                  <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#1E3A5F"
                  strokeWidth={2}
                  fill="url(#colorRegs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Revenue Trend
          </h2>
          <div className="h-72">
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
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Events by Category
          </h2>
          <div className="h-64">
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
        </Card>

        {/* Event Type Distribution */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Online vs Offline
          </h2>
          <div className="h-64">
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
        </Card>

        {/* Top Events */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Top Events
          </h2>
          <div className="space-y-3">
            {topEvents.map((event, index) => (
              <div key={event.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                  index === 0 ? 'bg-accent' :
                  index === 1 ? 'bg-primary' :
                  'bg-gray-400'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {event.registrations} registrations
                  </p>
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  ₹{event.revenue.toLocaleString()}
                </p>
              </div>
            ))}
            {topEvents.length === 0 && (
              <p className="text-center text-text-secondary py-8">
                No events yet
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
