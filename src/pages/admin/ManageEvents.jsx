import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Copy,
  Users,
  MoreVertical,
  QrCode
} from 'lucide-react';
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { EventQRModal } from '../../components/common';
import { format } from 'date-fns';
import { EVENT_CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, event: null });
  const [activeMenu, setActiveMenu] = useState(null);
  const [qrModal, setQrModal] = useState({ open: false, eventId: null, eventTitle: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, categoryFilter, statusFilter]);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const eventsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(event => event.status === statusFilter);
    }
    setFilteredEvents(filtered);
  };

  const handleDelete = async () => {
    if (!deleteModal.event) return;
    try {
      await deleteDoc(doc(db, 'events', deleteModal.event.id));
      setEvents(events.filter(e => e.id !== deleteModal.event.id));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleteModal({ open: false, event: null });
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await updateDoc(doc(db, 'events', eventId), { status: newStatus });
      setEvents(events.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
      toast.success('Event status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
    setActiveMenu(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  const containerStyle = { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' };
  const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' };
  const titleStyle = { fontSize: '1.5rem', fontWeight: 'bold', color: '#1E3A5F' };
  const subtitleStyle = { color: '#64748B', fontSize: '0.875rem' };

  const filterCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const searchBoxStyle = {
    maxWidth: '24rem',
    minWidth: '200px',
    position: 'relative',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '0.625rem 1rem 0.625rem 2.5rem',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: '#F8FAFC',
  };

  const selectStyle = {
    padding: '0.625rem 1rem',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: '#F8FAFC',
    minWidth: '150px',
  };

  const tableCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  };

  const tableStyle = { width: '100%', borderCollapse: 'collapse' };

  const thStyle = {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  };

  const tdStyle = {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #F1F5F9',
  };

  const eventImageStyle = {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.5rem',
    objectFit: 'cover',
    backgroundColor: 'rgba(30, 58, 95, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const actionBtnStyle = {
    padding: '0.5rem',
    borderRadius: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const dropdownStyle = {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '0.5rem',
    width: '12rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    border: '1px solid #E2E8F0',
    zIndex: 50,
    padding: '0.25rem 0',
  };

  const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    color: '#1E3A5F',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  };

  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  };

  const modalStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '400px',
    margin: '1rem',
  };

  const categoryBadgeStyle = {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#F1F5F9',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#64748B',
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'closed', label: 'Closed' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Manage Events</h1>
          <p style={subtitleStyle}>View and manage all your events</p>
        </div>
        <Link to="/admin/events/create">
          <Button variant="primary" icon={Plus}>Create Event</Button>
        </Link>
      </div>

      {/* Filters */}
      <div style={filterCardStyle}>
        <div style={searchBoxStyle}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Categories</option>
            {EVENT_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div style={tableCardStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Event</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Registrations</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} style={tdStyle}>
                      <div style={{ height: '3rem', backgroundColor: '#E5E7EB', borderRadius: '0.5rem' }} />
                    </td>
                  </tr>
                ))
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event.id} style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={eventImageStyle}>
                          {event.bannerUrl ? (
                            <img src={event.bannerUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
                          ) : (
                            <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#1E3A5F' }} />
                          )}
                        </div>
                        <div>
                          <p style={{ fontWeight: '500', color: '#1E3A5F', fontSize: '0.875rem' }}>{event.title}</p>
                          <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{event.type}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '0.875rem', color: '#64748B' }}>
                      {formatDate(event.eventDate)}
                    </td>
                    <td style={tdStyle}>
                      <span style={categoryBadgeStyle}>{event.category}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                        <span style={{ fontSize: '0.875rem', color: '#1E3A5F' }}>
                          {event.currentCount || 0}/{event.maxParticipants || 0}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={event.status || 'draft'} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', position: 'relative' }}>
                        <Link to={`/events/${event.id}`} target="_blank">
                          <button style={actionBtnStyle} title="Preview"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Eye style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                          </button>
                        </Link>
                        <button
                          style={actionBtnStyle}
                          title="QR Code & Link"
                          onClick={() => setQrModal({ open: true, eventId: event.id, eventTitle: event.title })}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <QrCode style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                        </button>
                        <Link to={`/admin/events/${event.id}/edit`}>
                          <button style={actionBtnStyle} title="Edit"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Edit style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                          </button>
                        </Link>
                        <div style={{ position: 'relative' }}>
                          <button
                            style={actionBtnStyle}
                            onClick={() => setActiveMenu(activeMenu === event.id ? null : event.id)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <MoreVertical style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                          </button>
                          {activeMenu === event.id && (
                            <>
                              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setActiveMenu(null)} />
                              <div style={dropdownStyle}>
                                {event.status === 'draft' && (
                                  <button style={dropdownItemStyle} onClick={() => handleStatusChange(event.id, 'published')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    Publish Event
                                  </button>
                                )}
                                {event.status === 'published' && (
                                  <button style={dropdownItemStyle} onClick={() => handleStatusChange(event.id, 'closed')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    Close Registration
                                  </button>
                                )}
                                <button
                                  style={dropdownItemStyle}
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
                                    toast.success('Link copied!');
                                    setActiveMenu(null);
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <Copy style={{ width: '1rem', height: '1rem' }} />
                                  Copy Link
                                </button>
                                <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: '1px solid #E2E8F0' }} />
                                <button
                                  style={{ ...dropdownItemStyle, color: '#EF4444' }}
                                  onClick={() => { setDeleteModal({ open: true, event }); setActiveMenu(null); }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <Trash2 style={{ width: '1rem', height: '1rem' }} />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <Calendar style={{ width: '3rem', height: '3rem', color: '#CBD5E1', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontWeight: '500', color: '#1E3A5F', marginBottom: '0.25rem' }}>No events found</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                      {searchTerm || categoryFilter || statusFilter
                        ? 'Try adjusting your filters'
                        : 'Create your first event to get started'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div style={modalOverlayStyle} onClick={() => setDeleteModal({ open: false, event: null })}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1E3A5F', marginBottom: '1rem' }}>Delete Event</h2>
            <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
              Are you sure you want to delete "{deleteModal.event?.title}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="ghost" onClick={() => setDeleteModal({ open: false, event: null })}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete Event
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <EventQRModal
        isOpen={qrModal.open}
        onClose={() => setQrModal({ open: false, eventId: null, eventTitle: '' })}
        eventId={qrModal.eventId}
        eventTitle={qrModal.eventTitle}
      />
    </div>
  );
};

export default ManageEvents;
