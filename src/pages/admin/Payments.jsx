import { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Search,
  TrendingUp,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  XCircle
} from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const paymentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(paymentsList);

      setStats({
        total: paymentsList.length,
        completed: paymentsList.filter(p => p.status === 'completed').length,
        pending: paymentsList.filter(p => p.status === 'pending').length,
        totalRevenue: paymentsList
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + (p.amount || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.registrationId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  const exportToCSV = () => {
    const headers = ['Payment ID', 'Registration ID', 'Amount', 'Status', 'Date'];
    const data = filteredPayments.map(payment => [
      payment.razorpayPaymentId || payment.id,
      payment.registrationId,
      payment.amount,
      payment.status,
      formatDate(payment.createdAt),
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Export successful!');
  };

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

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
      refunded: { backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' },
    };
    return styles[status] || styles.pending;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>Payments</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Track all payment transactions
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
            <CreditCard style={{ width: '1.25rem', height: '1.25rem', color: '#8B5CF6' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              {stats.total}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Total Transactions</p>
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
              {stats.completed}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Completed</p>
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
            <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#F59E0B' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              {stats.pending}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Pending</p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(233, 30, 99, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              ₹{stats.totalRevenue.toLocaleString()}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ maxWidth: '24rem', minWidth: '200px', position: 'relative' }}>
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
              placeholder="Search by Payment ID or Registration ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
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
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            Loading...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <CreditCard style={{ width: '3rem', height: '3rem', color: '#CBD5E1', margin: '0 auto 1rem' }} />
            <p>No payments found</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Payment ID</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Registration</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr key={row.id} style={{ borderBottom: index < paginatedData.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#1E293B' }}>
                          {row.razorpayPaymentId || row.id.slice(0, 12)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#64748B' }}>
                          {row.registrationId?.slice(0, 15) || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B' }}>
                          ₹{row.amount || 0}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          ...getStatusStyle(row.status),
                        }}>
                          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                          {formatDate(row.createdAt)}
                        </span>
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} entries
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

export default Payments;
