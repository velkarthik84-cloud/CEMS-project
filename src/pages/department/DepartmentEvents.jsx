import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  ChevronDown,
  Eye,
  UserPlus,
  X,
  Video,
  Building,
  Award,
  Music,
  Mic,
  Drama,
  Palette,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_ICONS = {
  cultural: Music,
  dance: Music,
  singing: Mic,
  drama: Drama,
  art: Palette,
  workshop: Building,
  seminar: Building,
  exam: Award,
  training: Star,
  conference: Building,
  webinar: Video,
};

const DepartmentEvents = () => {
  const { departmentSession } = useOutletContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    // Set up real-time listener for events
    const eventsRef = collection(db, 'events');
    const eventsQuery = query(eventsRef, where('status', '==', 'published'));

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by event date
      eventsData.sort((a, b) => {
        const dateA = a.eventDate?.toDate ? a.eventDate.toDate() : new Date(a.eventDate);
        const dateB = b.eventDate?.toDate ? b.eventDate.toDate() : new Date(b.eventDate);
        return dateA - dateB;
      });
      setEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch registered events for this department
  useEffect(() => {
    if (!departmentSession?.departmentId) return;

    const fetchRegistrations = async () => {
      const registrationsRef = collection(db, 'registrations');
      const regQuery = query(
        registrationsRef,
        where('departmentId', '==', departmentSession.departmentId)
      );
      const snapshot = await getDocs(regQuery);
      const eventIds = snapshot.docs.map(doc => doc.data().eventId);
      setRegisteredEvents(eventIds);
    };

    fetchRegistrations();
  }, [departmentSession]);

  // Handle URL params for pre-selecting event
  useEffect(() => {
    const eventId = searchParams.get('eventId');
    if (eventId && events.length > 0) {
      const event = events.find(e => e.id === eventId);
      if (event) setSelectedEvent(event);
    }
  }, [searchParams, events]);

  // Filter events
  useEffect(() => {
    let filtered = [...events];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title?.toLowerCase().includes(term) ||
        e.category?.toLowerCase().includes(term) ||
        e.venue?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, categoryFilter]);

  const categories = [...new Set(events.map(e => e.category))].filter(Boolean);

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const formatEventDate = (date) => {
    const eventDate = date?.toDate ? date.toDate() : new Date(date);
    return format(eventDate, 'MMM dd, yyyy');
  };

  const isEventPast = (date) => {
    const eventDate = date?.toDate ? date.toDate() : new Date(date);
    return eventDate < new Date();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid #E2E8F0',
          borderTopColor: '#E91E63',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1.25rem',
              height: '1.25rem',
              color: '#64748B',
            }} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#1E293B',
              }}
            >
              <Filter style={{ width: '1rem', height: '1rem' }} />
              Filter
              <ChevronDown style={{ width: '1rem', height: '1rem' }} />
            </button>
            {showFilters && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                padding: '0.5rem',
                zIndex: 10,
                minWidth: '180px',
              }}>
                <button
                  onClick={() => { setCategoryFilter('all'); setShowFilters(false); }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    textAlign: 'left',
                    backgroundColor: categoryFilter === 'all' ? '#F8FAFC' : 'transparent',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                  }}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setShowFilters(false); }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      textAlign: 'left',
                      backgroundColor: categoryFilter === cat ? '#F8FAFC' : 'transparent',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#1E293B',
                      textTransform: 'capitalize',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <Calendar style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem', color: '#64748B', margin: 0 }}>No events found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
          {filteredEvents.map((event) => {
            const isPast = isEventPast(event.eventDate);
            const isRegistered = registeredEvents.includes(event.id);
            const Icon = CATEGORY_ICONS[event.category?.toLowerCase()] || Calendar;

            return (
              <div
                key={event.id}
                style={{
                  ...cardStyle,
                  opacity: isPast ? 0.7 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Event Banner */}
                {event.bannerUrl && (
                  <div style={{
                    height: '140px',
                    margin: '-1.5rem -1.5rem 1rem -1.5rem',
                    backgroundImage: `url(${event.bannerUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#1E3A5F',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                    }}>
                      {event.category}
                    </div>
                    {isRegistered && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                      }}>
                        Registered
                      </div>
                    )}
                  </div>
                )}

                {!event.bannerUrl && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'rgba(30, 58, 95, 0.1)',
                      color: '#1E3A5F',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                    }}>
                      {event.category}
                    </span>
                    {isRegistered && (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                      }}>
                        Registered
                      </span>
                    )}
                  </div>
                )}

                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1E293B',
                  margin: '0 0 0.75rem 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {event.title}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                      {formatEventDate(event.eventDate)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {event.type === 'online' ? (
                      <Video style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                    ) : (
                      <MapPin style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                    )}
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                      {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                      {event.currentCount || 0} / {event.maxParticipants || 'Unlimited'} participants
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      color: '#1E293B',
                    }}
                  >
                    <Eye style={{ width: '1rem', height: '1rem' }} />
                    View Details
                  </button>
                  {!isPast && !isRegistered && (
                    <button
                      onClick={() => navigate(`/department/register?eventId=${event.id}`)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem',
                        backgroundColor: '#E91E63',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        color: '#FFFFFF',
                      }}
                    >
                      <UserPlus style={{ width: '1rem', height: '1rem' }} />
                      Register
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {selectedEvent.bannerUrl && (
              <div style={{
                height: '200px',
                backgroundImage: `url(${selectedEvent.bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '1rem 1rem 0 0',
              }} />
            )}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(30, 58, 95, 0.1)',
                    color: '#1E3A5F',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    marginBottom: '0.5rem',
                  }}>
                    {selectedEvent.category}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                    {selectedEvent.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <X style={{ width: '1.5rem', height: '1.5rem', color: '#64748B' }} />
                </button>
              </div>

              {/* Event Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#1E3A5F' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Date</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                      {formatEventDate(selectedEvent.eventDate)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#1E3A5F' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Time</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <MapPin style={{ width: '1.25rem', height: '1.25rem', color: '#1E3A5F' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Venue</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                      {selectedEvent.type === 'online' ? 'Online' : selectedEvent.venue || 'TBA'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Users style={{ width: '1.25rem', height: '1.25rem', color: '#1E3A5F' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Participants</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                      {selectedEvent.currentCount || 0} / {selectedEvent.maxParticipants || 'Unlimited'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
                    Description
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {/* Rules */}
              {selectedEvent.categoryDetails?.rules && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
                    Rules & Guidelines
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedEvent.categoryDetails.rules}
                  </p>
                </div>
              )}

              {/* Judges */}
              {selectedEvent.judges && selectedEvent.judges.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
                    Judges
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedEvent.judges.map((judge, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '0.5rem',
                          fontSize: '0.8125rem',
                          color: '#1E293B',
                        }}
                      >
                        {judge.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Register Button */}
              {!isEventPast(selectedEvent.eventDate) && !registeredEvents.includes(selectedEvent.id) && (
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    navigate(`/department/register?eventId=${selectedEvent.id}`);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem',
                    backgroundColor: '#E91E63',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#FFFFFF',
                  }}
                >
                  <UserPlus style={{ width: '1.25rem', height: '1.25rem' }} />
                  Register for this Event
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentEvents;
