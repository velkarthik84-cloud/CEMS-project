import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, Clock, ArrowRight, Search, Star, TrendingUp } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Button, Card } from '../../components/common';
import { format } from 'date-fns';
import { EVENT_CATEGORIES } from '../../utils/constants';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('status', '==', 'published'),
        orderBy('eventDate', 'asc'),
        limit(8)
      );
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setFeaturedEvents(events.slice(0, 3));
      setUpcomingEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Discover & Join
              <span className="text-accent"> Amazing Events</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Find workshops, seminars, conferences, and more. Register instantly with
              QR-based entry and seamless payment.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events, workshops, seminars..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-text-primary bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <Button size="lg" variant="accent" className="px-8">
                  Search Events
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-white/70">Events Hosted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-white/70">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-white/70">Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="text-white/70 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" /> Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              All Events
            </button>
            {EVENT_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                Featured Events
              </h2>
              <p className="text-text-secondary mt-1">
                Hand-picked events you don't want to miss
              </p>
            </div>
            <Link to="/events">
              <Button variant="ghost" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
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
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} formatDate={formatDate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No events yet
              </h3>
              <p className="text-text-secondary">
                Check back later for upcoming events
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                Upcoming Events
              </h2>
              <p className="text-text-secondary mt-1">
                Don't miss out on these amazing opportunities
              </p>
            </div>
            <Link to="/events">
              <Button variant="ghost" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} formatDate={formatDate} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary">No upcoming events available</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
              How It Works
            </h2>
            <p className="text-text-secondary mt-2">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Browse Events
              </h3>
              <p className="text-text-secondary">
                Explore a wide range of events from workshops to conferences
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Register & Pay
              </h3>
              <p className="text-text-secondary">
                Fill in your details and complete payment securely
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Attend & Learn
              </h3>
              <p className="text-text-secondary">
                Use your QR code for entry and enjoy the event
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Host Your Own Event?
          </h2>
          <p className="text-white/80 mb-8">
            Create and manage events with our powerful dashboard. QR-based entry,
            payment processing, and real-time analytics included.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="accent">
                Get Started Free
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, formatDate, compact = false }) => {
  return (
    <Link to={`/events/${event.id}`}>
      <Card className={`overflow-hidden group ${compact ? '' : ''}`} hover padding="none">
        <div className={`relative ${compact ? 'h-36' : 'h-48'} overflow-hidden`}>
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
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary">
              {event.category}
            </span>
          </div>
          {event.fee > 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-accent text-white rounded-full text-xs font-bold">
                ₹{event.fee}
              </span>
            </div>
          )}
        </div>
        <div className={compact ? 'p-4' : 'p-6'}>
          <h3 className={`font-semibold text-text-primary mb-2 line-clamp-2 ${compact ? 'text-sm' : 'text-lg'}`}>
            {event.title}
          </h3>
          <div className="space-y-1.5 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(event.eventDate)}
            </div>
            {!compact && (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {event.startTime} - {event.endTime}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
                </div>
              </>
            )}
          </div>
          {!compact && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Users className="w-4 h-4" />
                {event.currentCount || 0}/{event.maxParticipants} registered
              </div>
              <span className="text-primary font-medium text-sm group-hover:underline">
                View Details →
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default Home;
