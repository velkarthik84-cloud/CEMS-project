import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Download,
  Mail,
  Phone,
  Eye,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Participants = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, eventFilter, statusFilter]);

  const fetchData = async () => {
    try {
      const regsRef = collection(db, 'registrations');
      const regsQuery = query(regsRef, orderBy('createdAt', 'desc'));
      const regsSnapshot = await getDocs(regsQuery);
      const regsList = regsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistrations(regsList);

      const eventsRef = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsRef);
      const eventsList = eventsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().title,
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = [...registrations];

    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.mobile?.includes(searchTerm) ||
        reg.registrationId?.includes(searchTerm)
      );
    }

    if (eventFilter) {
      filtered = filtered.filter(reg => reg.eventId === eventFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(reg => reg.paymentStatus === statusFilter);
    }

    setFilteredRegistrations(filtered);
    setCurrentPage(1);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  const exportToCSV = () => {
    const headers = ['Registration ID', 'Name', 'Email', 'Mobile', 'Event', 'Payment Status', 'Date'];
    const data = filteredRegistrations.map(reg => [
      reg.registrationId,
      reg.fullName,
      reg.email,
      reg.mobile,
      reg.eventTitle,
      reg.paymentStatus,
      formatDate(reg.createdAt),
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Export successful!');
  };

  // Pagination
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.875rem',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  const statCardStyle = {
    ...cardStyle,
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 1rem 0.625rem 2.5rem',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#1E293B',
    outline: 'none',
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

  const getStatusStyle = (status) => {
    const styles = {
      completed: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
      pending: { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
      failed: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
    };
    return styles[status] || styles.pending;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>Bookings</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Manage all event registrations ({registrations.length} total)
          </p>
        </div>
        <button
          onClick={exportToCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#1E293B',
            cursor: 'pointer',
          }}
        >
          <Download style={{ width: '1rem', height: '1rem' }} />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1.25rem' }}>
        <div style={statCardStyle}>
          <div style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Users style={{ width: '1.25rem', height: '1.25rem', color: '#8B5CF6' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              {registrations.length}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Total Bookings</p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              {registrations.filter(r => r.paymentStatus === 'completed').length}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Confirmed</p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Users style={{ width: '1.25rem', height: '1.25rem', color: '#F59E0B' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              {registrations.filter(r => r.paymentStatus === 'pending').length}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Pending</p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#3B82F6' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              {registrations.filter(r => r.attendanceStatus === 'checked_in').length}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Checked In</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1rem',
              height: '1rem',
              color: '#94A3B8',
            }} />
            <input
              type="text"
              placeholder="Search by name, email, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">All Events</option>
              {events.map(event => (
                <option key={event.value} value={event.value}>{event.label}</option>
              ))}
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
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
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
        </div>
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            Loading...
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            No participants found
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Participant</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Contact</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Event</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Payment</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Attendance</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr key={row.id} style={{ borderBottom: index < paginatedData.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                          }}>
                            {row.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>{row.fullName}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>{row.registrationId}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
                            <Mail style={{ width: '0.875rem', height: '0.875rem' }} />
                            {row.email}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
                            <Phone style={{ width: '0.875rem', height: '0.875rem' }} />
                            {row.mobile}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#1E293B', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {row.eventTitle}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B' }}>
                          {row.amount > 0 ? `₹${row.amount}` : 'Free'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          ...getStatusStyle(row.paymentStatus),
                        }}>
                          {row.paymentStatus?.charAt(0).toUpperCase() + row.paymentStatus?.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          {row.attendanceStatus === 'checked_in' ? (
                            <CheckCircle style={{ width: '1rem', height: '1rem', color: '#10B981' }} />
                          ) : (
                            <XCircle style={{ width: '1rem', height: '1rem', color: '#CBD5E1' }} />
                          )}
                          <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                            {row.attendanceStatus === 'checked_in' ? 'Present' : 'Not Yet'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>{formatDate(row.createdAt)}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <Link to={`/admin/participants/${row.id}`}>
                          <button style={{
                            padding: '0.5rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            color: '#64748B',
                          }}>
                            <Eye style={{ width: '1.125rem', height: '1.125rem' }} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderTop: '1px solid #F1F5F9',
              }}>
                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRegistrations.length)} of {filteredRegistrations.length} entries
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: currentPage === 1 ? '#F8FAFC' : '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.375rem',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                  >
                    <ChevronLeft style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                    Math.max(0, currentPage - 3),
                    Math.min(totalPages, currentPage + 2)
                  ).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: currentPage === page ? '#E91E63' : '#FFFFFF',
                        color: currentPage === page ? '#FFFFFF' : '#64748B',
                        border: '1px solid',
                        borderColor: currentPage === page ? '#E91E63' : '#E2E8F0',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: currentPage === totalPages ? '#F8FAFC' : '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.375rem',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                    }}
                  >
                    <ChevronRight style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Participants;
