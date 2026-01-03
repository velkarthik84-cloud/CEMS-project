import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Ticket,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    ticketsSold: 0,
    upcomingEvents: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [upcomingEventsList, setUpcomingEventsList] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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
      const upcoming = events.filter(e => {
        const eventDate = getValidDate(e.eventDate);
        return eventDate && eventDate > now;
      });

      const ticketsSold = payments.filter(p => p.status === 'completed').length;

      setStats({
        totalEvents: events.length,
        totalRegistrations: registrations.length,
        ticketsSold,
        upcomingEvents: upcoming.length,
      });

      if (upcoming.length > 0) {
        setFeaturedEvent(upcoming[0]);
      }

      setUpcomingEventsList(upcoming.slice(0, 3));

      setRecentEvents(
        events
          .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0))
          .slice(0, 4)
      );

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
      const salesChartData = months.map(month => ({
        name: month,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        profit: Math.floor(Math.random() * 30000) + 5000,
      }));
      setSalesData(salesChartData);

      const categories = {};
      events.forEach(e => {
        const cat = e.category || 'Other';
        categories[cat] = (categories[cat] || 0) + 1;
      });

      const totalEvents = events.length || 1;
      setCategoryData(
        Object.entries(categories).map(([name, value]) => ({
          name,
          value,
          percentage: Math.round((value / totalEvents) * 100)
        }))
      );

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getValidDate = (timestamp) => {
    if (!timestamp) return null;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const formatDate = (timestamp) => {
    const date = getValidDate(timestamp);
    if (!date) return '-';
    return format(date, 'MMM dd, yyyy');
  };

  const formatTime = (timestamp) => {
    const date = getValidDate(timestamp);
    if (!date) return '-';
    return format(date, 'hh:mm a');
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const prevMonthDays = Array(startDayOfWeek).fill(null);

  // Donut chart data
  const ticketData = [
    { name: 'Sold Out', value: 1251, percentage: 45, color: '#1E3A5F' },
    { name: 'Fully Booked', value: 834, percentage: 30, color: '#E91E63' },
    { name: 'Available', value: 695, percentage: 25, color: '#94A3B8' },
  ];
  const totalTickets = 2780;

  const COLORS = ['#1E3A5F', '#E91E63', '#10B981', '#F59E0B'];

  const popularEvents = [
    { name: 'Music', percentage: 40, events: '20,000 Events', color: '#1E3A5F' },
    { name: 'Sports', percentage: 35, events: '17,500 Events', color: '#E91E63' },
    { name: 'Fashion', percentage: 15, events: '12,500 Events', color: '#10B981' },
  ];

  // Common card style for consistent padding
  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.875rem',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', width: '100%', maxWidth: '100%', overflow: 'hidden', paddingBottom: '1.5rem' }}>
      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.25rem' }}>
          {/* Upcoming Events Card */}
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#8B5CF6' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.125rem' }}>Upcoming Events</p>
              <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{stats.upcomingEvents || 345}</p>
            </div>
          </div>

          {/* Total Bookings Card */}
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(233, 30, 99, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Users style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.125rem' }}>Total Bookings</p>
              <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{stats.totalRegistrations || 1798}</p>
            </div>
          </div>

          {/* Tickets Sold Card */}
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Ticket style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.125rem' }}>Tickets Sold</p>
              <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{stats.ticketsSold || 1250}</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr]" style={{ gap: '1.25rem' }}>
          {/* Ticket Sales Donut Chart */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>Ticket Sales</h3>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: '#F1F5F9',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                color: '#64748B',
                cursor: 'pointer',
              }}>
                This Week <ChevronDown style={{ width: '0.75rem', height: '0.75rem' }} />
              </button>
            </div>

            {/* Donut Chart */}
            <div style={{ height: '200px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {ticketData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Ticket</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E3A5F' }}>{totalTickets.toLocaleString()}</p>
              </div>
            </div>

            {/* Legend - Below Chart */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {ticketData.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>{item.value.toLocaleString()}</span>
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Revenue Bar Chart */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>Sales Revenue</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem' }}>Total Revenue</p>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B' }}>$348,805</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#F1F5F9',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#64748B',
                  cursor: 'pointer',
                }}>
                  Last 8 Months <ChevronDown style={{ width: '0.75rem', height: '0.75rem' }} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#1E3A5F' }} />
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Revenue</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#E91E63' }} />
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Profit</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(233, 30, 99, 0.08)',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Revenue</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#E91E63' }}>$56,320</span>
            </div>

            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}K`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="revenue" fill="#1E3A5F" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="profit" fill="#E91E63" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Popular Events & All Events Row */}
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr]" style={{ gap: '1.25rem' }}>
          {/* Popular Events */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>Popular Events</h3>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: '#F1F5F9',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                color: '#64748B',
                cursor: 'pointer',
              }}>
                Popular <ChevronDown style={{ width: '0.75rem', height: '0.75rem' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {popularEvents.map((event, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B' }}>{event.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{event.events}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      flex: 1,
                      height: '0.5rem',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${event.percentage}%`,
                        backgroundColor: event.color,
                        borderRadius: '1rem',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: event.color, minWidth: '2.5rem' }}>{event.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Events */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>All Events</h3>
              <Link to="/admin/events" style={{ fontSize: '0.8125rem', color: '#E91E63', textDecoration: 'none', fontWeight: '500' }}>
                View All Event
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentEvents.length > 0 ? recentEvents.slice(0, 3).map((event, index) => (
                <Link
                  key={event.id}
                  to={`/admin/events/${event.id}/edit`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    position: 'relative',
                    height: '140px',
                    cursor: 'pointer',
                  }}>
                    <img
                      src={event.bannerUrl || `https://picsum.photos/seed/${index + 10}/300/200`}
                      alt={event.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      backgroundColor: '#E91E63',
                      color: '#FFFFFF',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.6875rem',
                      fontWeight: '600',
                    }}>
                      {event.category || 'Event'}
                    </div>
                  </div>
                </Link>
              )) : (
                <>
                  <div style={{ borderRadius: '0.75rem', overflow: 'hidden', height: '140px' }}>
                    <img src="https://picsum.photos/seed/sport/300/200" alt="Sport" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ borderRadius: '0.75rem', overflow: 'hidden', height: '140px' }}>
                    <img src="https://picsum.photos/seed/food/300/200" alt="Food" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ borderRadius: '0.75rem', overflow: 'hidden', height: '140px' }}>
                    <img src="https://picsum.photos/seed/fashion/300/200" alt="Fashion" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden 2xl:block" style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Upcoming Event Card */}
        <div style={{
          ...cardStyle,
          padding: 0,
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>Upcoming Event</h3>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
              <MoreHorizontal style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
            </button>
          </div>
          {featuredEvent ? (
            <div>
              <div style={{ height: '180px', position: 'relative' }}>
                <img
                  src={featuredEvent.bannerUrl || 'https://picsum.photos/seed/concert/400/300'}
                  alt={featuredEvent.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}>
                  {featuredEvent.category || 'Music'}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  right: '1rem',
                  color: '#FFFFFF',
                }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.375rem' }}>
                    {featuredEvent.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {featuredEvent.description?.slice(0, 80) || 'Immerse yourself in electrifying performances by top artists.'}...
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', opacity: 0.9 }}>
                    <MapPin style={{ width: '0.875rem', height: '0.875rem' }} />
                    <span>{featuredEvent.venue || 'Event Venue'}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar style={{ width: '1rem', height: '1rem', color: '#E91E63' }} />
                  <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                    {formatDate(featuredEvent.eventDate)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock style={{ width: '1rem', height: '1rem', color: '#E91E63' }} />
                  <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                    {formatTime(featuredEvent.startTime)}
                  </span>
                </div>
              </div>
              <div style={{ padding: '0 1.25rem 1.25rem' }}>
                <Link
                  to={`/admin/events/${featuredEvent.id}/edit`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '0.75rem',
                    backgroundColor: '#E91E63',
                    color: '#FFFFFF',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
              <p>No upcoming events</p>
            </div>
          )}
        </div>

        {/* Calendar Widget */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <ChevronDown style={{ width: '1rem', height: '1rem', color: '#94A3B8' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#F8FAFC',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#F8FAFC',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#94A3B8',
                padding: '0.5rem 0',
              }}>
                {day}
              </div>
            ))}
            {prevMonthDays.map((_, index) => (
              <div key={`prev-${index}`} style={{ padding: '0.5rem' }} />
            ))}
            {monthDays.map(day => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const hasEvent = upcomingEventsList.some(event => {
                const eventDate = getValidDate(event.eventDate);
                return eventDate && isSameDay(eventDate, day);
              });

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: isSelected ? '#E91E63' : isToday ? 'rgba(233, 30, 99, 0.1)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : isToday ? '#E91E63' : '#1E293B',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected || isToday ? '600' : '400',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 'auto',
                  }}
                >
                  {format(day, 'd')}
                  {hasEvent && !isSelected && (
                    <span style={{
                      position: 'absolute',
                      bottom: '0.125rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '0.25rem',
                      height: '0.25rem',
                      borderRadius: '50%',
                      backgroundColor: '#E91E63',
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events List */}
        <div style={cardStyle}>
          {upcomingEventsList.length > 0 ? upcomingEventsList.map((event, index) => {
            const eventDate = getValidDate(event.eventDate);
            if (!eventDate) return null;
            return (
              <Link
                key={event.id}
                to={`/admin/events/${event.id}/edit`}
                style={{
                  display: 'flex',
                  gap: '0.875rem',
                  padding: '0.75rem 0',
                  borderBottom: index < upcomingEventsList.length - 1 ? '1px solid #F1F5F9' : 'none',
                  textDecoration: 'none',
                }}
              >
                <div style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.75rem',
                  backgroundColor: ['#8B5CF6', '#E91E63', '#10B981'][index % 3],
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', lineHeight: 1 }}>
                    {format(eventDate, 'd')}
                  </span>
                  <span style={{ fontSize: '0.625rem', fontWeight: '500', textTransform: 'uppercase' }}>
                    {format(eventDate, 'EEE')}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1E293B',
                    marginBottom: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {event.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                    <span style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      color: '#8B5CF6',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      fontWeight: '500',
                    }}>
                      {event.category || 'Event'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                      {formatTime(event.startTime)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          }) : (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem', padding: '1rem 0' }}>
              No upcoming events
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
