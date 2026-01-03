import { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Search,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Button, Card, Select, Table } from '../../components/common';
import { StatusBadge } from '../../components/common/Badge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
      // Fetch payments
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const paymentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(paymentsList);

      // Fetch registrations for additional payment info
      const regsRef = collection(db, 'registrations');
      const regsSnapshot = await getDocs(regsRef);
      const regPayments = regsSnapshot.docs
        .filter(doc => doc.data().amount > 0)
        .map(doc => ({ id: doc.id, ...doc.data(), type: 'registration' }));

      // Calculate stats
      const allPayments = [...paymentsList];
      setStats({
        total: allPayments.length,
        completed: allPayments.filter(p => p.status === 'completed').length,
        pending: allPayments.filter(p => p.status === 'pending').length,
        totalRevenue: allPayments
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

  const statusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const columns = [
    {
      key: 'razorpayPaymentId',
      title: 'Payment ID',
      render: (value, row) => (
        <span className="font-mono text-sm text-text-primary">
          {value || row.id.slice(0, 12)}
        </span>
      ),
    },
    {
      key: 'registrationId',
      title: 'Registration',
      render: (value) => (
        <span className="text-sm text-text-secondary">{value?.slice(0, 15) || '-'}</span>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => (
        <span className="font-semibold text-text-primary">₹{value || 0}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'createdAt',
      title: 'Date',
      render: (value) => (
        <span className="text-sm text-text-secondary">{formatDate(value)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6" style={{ width: '100%' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Payments</h1>
          <p className="text-text-secondary">Track all payment transactions</p>
        </div>
        <Button icon={Download} variant="outline" onClick={exportToCSV}>
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stats.total}
              </p>
              <p className="text-sm text-text-secondary">Total Transactions</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stats.completed}
              </p>
              <p className="text-sm text-text-secondary">Completed</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stats.pending}
              </p>
              <p className="text-sm text-text-secondary">Pending</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-text-secondary">Total Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Payment ID or Registration ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All Status"
            className="w-full md:w-40"
          />
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredPayments}
        loading={loading}
        emptyMessage="No payments found"
      />
    </div>
  );
};

export default Payments;
