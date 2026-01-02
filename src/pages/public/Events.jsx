import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, Clock, Search, Filter, Grid, List } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Button, Card, Select } from '../../components/common';
import { format } from 'date-fns';
import { EVENT_CATEGORIES, EVENT_TYPES } from '../../utils/constants';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, categoryFilter, typeFilter]);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('status', '==', 'published'),
        orderBy('eventDate', 'asc')
      );
      const snapshot = await getDocs(q);
      const eventsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsList);
      setFilteredEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('');
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#F5F7FA',
    padding: '2rem 0',
  };

  const contentStyle = {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '0 1rem',
  };

  const headerStyle = {
    marginBottom: '2rem',
  };

  const titleStyle = {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1E3A5F',
  };

  const subtitleStyle = {
    color: '#64748B',
    marginTop: '0.25rem',
  };

  const filterBoxStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1rem',
    marginBottom: '2rem',
  };

  const filterRowStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const searchContainerStyle = {
    flex: 1,
    position: 'relative',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '0.625rem 1rem 0.625rem 2.5rem',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
  };

  const viewToggleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    padding: '0.25rem',
  };

  const viewButtonStyle = (isActive) => ({
    padding: '0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: isActive ? '#1E3A5F' : 'transparent',
    color: isActive ? '#FFFFFF' : '#6B7280',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const resultsStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    color: '#64748B',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  };

  const listStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '4rem 0',
  };

  const loadingCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>All Events</h1>
          <p style={subtitleStyle}>Browse and register for upcoming events</p>
        </div>

        {/* Filters */}
        <div style={filterBoxStyle}>
          <div style={filterRowStyle} className="lg:flex-row">
            {/* Search */}
            <div style={searchContainerStyle}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Category Filter */}
              <Select
                options={EVENT_CATEGORIES}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="All Categories"
              />

              {/* Type Filter */}
              <Select
                options={EVENT_TYPES}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                placeholder="All Types"
              />

              {/* Clear Filters */}
              {(searchTerm || categoryFilter || typeFilter) && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}

              {/* View Toggle */}
              <div style={viewToggleStyle}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={viewButtonStyle(viewMode === 'grid')}
                >
                  <Grid style={{ width: '1rem', height: '1rem' }} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={viewButtonStyle(viewMode === 'list')}
                >
                  <List style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={resultsStyle}>
          <p>Showing {filteredEvents.length} of {events.length} events</p>
        </div>

        {/* Events Grid/List */}
        {loading ? (
          <div style={gridStyle}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={loadingCardStyle}>
                <div style={{ height: '12rem', backgroundColor: '#E5E7EB' }} />
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ height: '1rem', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', width: '25%', marginBottom: '0.75rem' }} />
                  <div style={{ height: '1.5rem', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', width: '75%', marginBottom: '0.75rem' }} />
                  <div style={{ height: '1rem', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          viewMode === 'grid' ? (
            <div style={gridStyle}>
              {filteredEvents.map((event) => (
                <EventGridCard key={event.id} event={event} formatDate={formatDate} />
              ))}
            </div>
          ) : (
            <div style={listStyle}>
              {filteredEvents.map((event) => (
                <EventListCard key={event.id} event={event} formatDate={formatDate} />
              ))}
            </div>
          )
        ) : (
          <div style={emptyStateStyle}>
            <Calendar style={{ width: '4rem', height: '4rem', color: '#D1D5DB', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1E3A5F', marginBottom: '0.5rem' }}>
              No events found
            </h3>
            <p style={{ color: '#64748B', marginBottom: '1rem' }}>
              Try adjusting your filters or search term
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Grid Card Component
const EventGridCard = ({ event, formatDate }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: isHovered ? '0 20px 25px -5px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    transform: isHovered ? 'translateY(-4px)' : 'none',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const imageContainerStyle = {
    position: 'relative',
    height: '12rem',
    overflow: 'hidden',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  };

  const placeholderStyle = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #1E3A5F 0%, #152C4A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const badgeContainerStyle = {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    display: 'flex',
    gap: '0.5rem',
  };

  const categoryBadgeStyle = {
    padding: '0.25rem 0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#1E3A5F',
  };

  const typeBadgeStyle = (type) => ({
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    backgroundColor: type === 'online' ? '#DBEAFE' : '#D1FAE5',
    color: type === 'online' ? '#1D4ED8' : '#059669',
  });

  const priceBadgeStyle = (isFree) => ({
    position: 'absolute',
    bottom: '0.75rem',
    right: '0.75rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: isFree ? '#10B981' : '#E91E63',
  });

  const contentStyle = {
    padding: '1.5rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const titleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: isHovered ? '#1E3A5F' : '#1E3A5F',
    marginBottom: '0.5rem',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  };

  const descStyle = {
    fontSize: '0.875rem',
    color: '#64748B',
    marginBottom: '1rem',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  };

  const metaContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  };

  const metaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#64748B',
  };

  const footerStyle = {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={imageContainerStyle}>
          {event.bannerUrl ? (
            <img src={event.bannerUrl} alt={event.title} style={imageStyle} />
          ) : (
            <div style={placeholderStyle}>
              <Calendar style={{ width: '3rem', height: '3rem', color: 'rgba(255,255,255,0.5)' }} />
            </div>
          )}
          <div style={badgeContainerStyle}>
            <span style={categoryBadgeStyle}>{event.category}</span>
            <span style={typeBadgeStyle(event.type)}>{event.type}</span>
          </div>
          <span style={priceBadgeStyle(event.fee === 0)}>
            {event.fee > 0 ? `₹${event.fee}` : 'FREE'}
          </span>
        </div>
        <div style={contentStyle}>
          <h3 style={titleStyle}>{event.title}</h3>
          <p style={descStyle}>{event.description}</p>
          <div style={metaContainerStyle}>
            <div style={metaStyle}>
              <Calendar style={{ width: '1rem', height: '1rem', color: '#1E3A5F' }} />
              {formatDate(event.eventDate)}
            </div>
            <div style={metaStyle}>
              <Clock style={{ width: '1rem', height: '1rem', color: '#1E3A5F' }} />
              {event.startTime} - {event.endTime}
            </div>
            <div style={metaStyle}>
              <MapPin style={{ width: '1rem', height: '1rem', color: '#1E3A5F' }} />
              {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
            </div>
          </div>
          <div style={footerStyle}>
            <div style={metaStyle}>
              <Users style={{ width: '1rem', height: '1rem' }} />
              {event.currentCount || 0}/{event.maxParticipants}
            </div>
            <span style={{ color: '#1E3A5F', fontWeight: '500', fontSize: '0.875rem' }}>
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// List Card Component
const EventListCard = ({ event, formatDate }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: isHovered ? '0 10px 25px -5px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const innerStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '12rem',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  };

  const placeholderStyle = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #1E3A5F 0%, #152C4A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const contentStyle = {
    flex: 1,
    padding: '1.5rem',
  };

  const badgeContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  };

  const categoryBadgeStyle = {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#F1F5F9',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#1E3A5F',
  };

  const typeBadgeStyle = (type) => ({
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    backgroundColor: type === 'online' ? '#DBEAFE' : '#D1FAE5',
    color: type === 'online' ? '#1D4ED8' : '#059669',
  });

  const priceBadgeStyle = (isFree) => ({
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    backgroundColor: isFree ? 'rgba(16, 185, 129, 0.1)' : 'rgba(233, 30, 99, 0.1)',
    color: isFree ? '#10B981' : '#E91E63',
  });

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '0.5rem',
  };

  const descStyle = {
    color: '#64748B',
    marginBottom: '1rem',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  };

  const metaContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    fontSize: '0.875rem',
    color: '#64748B',
  };

  const metaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={innerStyle} className="sm:flex-row">
          <div style={imageContainerStyle} className="sm:w-64 sm:h-auto">
            {event.bannerUrl ? (
              <img src={event.bannerUrl} alt={event.title} style={imageStyle} />
            ) : (
              <div style={placeholderStyle}>
                <Calendar style={{ width: '3rem', height: '3rem', color: 'rgba(255,255,255,0.5)' }} />
              </div>
            )}
          </div>
          <div style={contentStyle}>
            <div style={badgeContainerStyle}>
              <span style={categoryBadgeStyle}>{event.category}</span>
              <span style={typeBadgeStyle(event.type)}>{event.type}</span>
              <span style={priceBadgeStyle(event.fee === 0)}>
                {event.fee > 0 ? `₹${event.fee}` : 'FREE'}
              </span>
            </div>
            <h3 style={titleStyle}>{event.title}</h3>
            <p style={descStyle}>{event.description}</p>
            <div style={metaContainerStyle}>
              <div style={metaStyle}>
                <Calendar style={{ width: '1rem', height: '1rem', color: '#1E3A5F' }} />
                {formatDate(event.eventDate)}
              </div>
              <div style={metaStyle}>
                <Clock style={{ width: '1rem', height: '1rem', color: '#1E3A5F' }} />
                {event.startTime} - {event.endTime}
              </div>
              <div style={metaStyle}>
                <MapPin style={{ width: '1rem', height: '1rem', color: '#1E3A5F' }} />
                {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
              </div>
              <div style={metaStyle}>
                <Users style={{ width: '1rem', height: '1rem', color: '#1E3A5F' }} />
                {event.currentCount || 0}/{event.maxParticipants} registered
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Events;
