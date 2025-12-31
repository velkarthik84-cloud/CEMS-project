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
  Filter
} from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Button, Card, Select, Table } from '../../components/common';
import { StatusBadge } from '../../components/common/Badge';
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
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, eventFilter, statusFilter]);

  const fetchData = async () => {
    try {
      // Fetch registrations
      const regsRef = collection(db, 'registrations');
      const regsQuery = query(regsRef, orderBy('createdAt', 'desc'));
      const regsSnapshot = await getDocs(regsQuery);
      const regsList = regsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistrations(regsList);

      // Fetch events for filter
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
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy HH:mm');
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

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

  const columns = [
    {
      key: 'participant',
      title: 'Participant',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white font-medium">
              {row.fullName?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.fullName}</p>
            <p className="text-sm text-text-secondary">{row.registrationId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (_, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Mail className="w-4 h-4" />
            {row.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Phone className="w-4 h-4" />
            {row.mobile}
          </div>
        </div>
      ),
    },
    {
      key: 'eventTitle',
      title: 'Event',
      render: (value) => (
        <span className="text-sm text-text-primary truncate max-w-[150px] block">
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => (
        <span className="font-medium text-text-primary">
          {value > 0 ? `₹${value}` : 'Free'}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      title: 'Payment',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'attendanceStatus',
      title: 'Attendance',
      render: (value) => (
        <div className="flex items-center gap-1">
          {value === 'checked_in' ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : (
            <XCircle className="w-4 h-4 text-gray-300" />
          )}
          <span className="text-sm text-text-secondary">
            {value === 'checked_in' ? 'Present' : 'Not Yet'}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Registered',
      render: (value) => (
        <span className="text-sm text-text-secondary">{formatDate(value)}</span>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <Link to={`/admin/participants/${row.id}`}>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Eye className="w-4 h-4 text-text-secondary" />
          </button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Participants</h1>
          <p className="text-text-secondary">
            Manage all event registrations ({registrations.length} total)
          </p>
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
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {registrations.length}
              </p>
              <p className="text-sm text-text-secondary">Total</p>
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
                {registrations.filter(r => r.paymentStatus === 'completed').length}
              </p>
              <p className="text-sm text-text-secondary">Confirmed</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Users className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {registrations.filter(r => r.paymentStatus === 'pending').length}
              </p>
              <p className="text-sm text-text-secondary">Pending</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {registrations.filter(r => r.attendanceStatus === 'checked_in').length}
              </p>
              <p className="text-sm text-text-secondary">Checked In</p>
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
              placeholder="Search by name, email, mobile, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <Select
            options={events}
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            placeholder="All Events"
            className="w-full md:w-56"
          />
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
        data={filteredRegistrations}
        loading={loading}
        emptyMessage="No participants found"
        selectable
        selectedRows={selectedRows}
        onSelectRow={setSelectedRows}
      />
    </div>
  );
};

export default Participants;
