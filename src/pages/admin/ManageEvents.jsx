import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Users
} from 'lucide-react';
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Button, Card, Select, Modal } from '../../components/common';
import { StatusBadge } from '../../components/common/Badge';
import { format } from 'date-fns';
import { EVENT_CATEGORIES, EVENT_STATUS } from '../../utils/constants';
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
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
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
      setEvents(events.map(e =>
        e.id === eventId ? { ...e, status: newStatus } : e
      ));
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

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'closed', label: 'Closed' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Events</h1>
          <p className="text-text-secondary">View and manage all your events</p>
        </div>
        <Link to="/admin/events/create">
          <Button icon={Plus}>Create Event</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <Select
            options={EVENT_CATEGORIES}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="All Categories"
            className="w-full md:w-48"
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

      {/* Events Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">
                  Event
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">
                  Registrations
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-12 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          {event.bannerUrl ? (
                            <img
                              src={event.bannerUrl}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{event.title}</p>
                          <p className="text-sm text-text-secondary">{event.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(event.eventDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-text-secondary">
                        {event.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm text-text-primary">
                          {event.currentCount || 0}/{event.maxParticipants}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative">
                        <Link to={`/events/${event.id}`} target="_blank">
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Preview">
                            <Eye className="w-4 h-4 text-text-secondary" />
                          </button>
                        </Link>
                        <Link to={`/admin/events/${event.id}/edit`}>
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                            <Edit className="w-4 h-4 text-text-secondary" />
                          </button>
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === event.id ? null : event.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreVertical className="w-4 h-4 text-text-secondary" />
                          </button>

                          {activeMenu === event.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveMenu(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                                {event.status === 'draft' && (
                                  <button
                                    onClick={() => handleStatusChange(event.id, 'published')}
                                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-50"
                                  >
                                    Publish Event
                                  </button>
                                )}
                                {event.status === 'published' && (
                                  <button
                                    onClick={() => handleStatusChange(event.id, 'closed')}
                                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-50"
                                  >
                                    Close Registration
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      `${window.location.origin}/events/${event.id}`
                                    );
                                    toast.success('Link copied!');
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4" />
                                  Copy Link
                                </button>
                                <hr className="my-1" />
                                <button
                                  onClick={() => {
                                    setDeleteModal({ open: true, event });
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-text-primary mb-1">No events found</h3>
                    <p className="text-sm text-text-secondary">
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
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, event: null })}
        title="Delete Event"
      >
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete "{deleteModal.event?.title}"? This action cannot be undone.
        </p>
        <Modal.Footer>
          <Button
            variant="ghost"
            onClick={() => setDeleteModal({ open: false, event: null })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete Event
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageEvents;
