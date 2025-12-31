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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">All Events</h1>
          <p className="text-text-secondary mt-1">
            Browse and register for upcoming events
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category Filter */}
            <Select
              options={EVENT_CATEGORIES}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="All Categories"
              className="w-full lg:w-48"
            />

            {/* Type Filter */}
            <Select
              options={EVENT_TYPES}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              placeholder="All Types"
              className="w-full lg:w-40"
            />

            {/* Clear Filters */}
            {(searchTerm || categoryFilter || typeFilter) && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}

            {/* View Toggle */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-text-secondary">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>

        {/* Events Grid/List */}
        {loading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventGridCard key={event.id} event={event} formatDate={formatDate} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <EventListCard key={event.id} event={event} formatDate={formatDate} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No events found
            </h3>
            <p className="text-text-secondary mb-4">
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
  return (
    <Link to={`/events/${event.id}`}>
      <Card className="overflow-hidden group h-full" hover padding="none">
        <div className="relative h-48 overflow-hidden">
          {event.bannerUrl ? (
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Calendar className="w-12 h-12 text-white/50" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary">
              {event.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              event.type === 'online'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {event.type}
            </span>
          </div>
          {event.fee > 0 && (
            <div className="absolute bottom-3 right-3">
              <span className="px-3 py-1 bg-accent text-white rounded-full text-sm font-bold">
                ₹{event.fee}
              </span>
            </div>
          )}
          {event.fee === 0 && (
            <div className="absolute bottom-3 right-3">
              <span className="px-3 py-1 bg-success text-white rounded-full text-sm font-bold">
                FREE
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-text-secondary mb-4 line-clamp-2">
            {event.description}
          </p>
          <div className="space-y-2 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {formatDate(event.eventDate)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {event.startTime} - {event.endTime}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Users className="w-4 h-4" />
              {event.currentCount || 0}/{event.maxParticipants}
            </div>
            <span className="text-primary font-medium text-sm group-hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

// List Card Component
const EventListCard = ({ event, formatDate }) => {
  return (
    <Link to={`/events/${event.id}`}>
      <Card className="overflow-hidden group" hover padding="none">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-64 h-48 sm:h-auto overflow-hidden flex-shrink-0">
            {event.bannerUrl ? (
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Calendar className="w-12 h-12 text-white/50" />
              </div>
            )}
          </div>
          <div className="flex-1 p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-primary">
                {event.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                event.type === 'online'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {event.type}
              </span>
              {event.fee > 0 ? (
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">
                  ₹{event.fee}
                </span>
              ) : (
                <span className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-bold">
                  FREE
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <p className="text-text-secondary mb-4 line-clamp-2">
              {event.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {formatDate(event.eventDate)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {event.startTime} - {event.endTime}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {event.currentCount || 0}/{event.maxParticipants} registered
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Events;
