import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Heart,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Badge } from '../../components/common';
import { PageLoader } from '../../components/common/Loading';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        setEvent({ id: eventSnap.id, ...eventSnap.data() });
      } else {
        toast.error('Event not found');
        navigate('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'EEEE, MMMM dd, yyyy');
  };

  const formatShortDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleRegister = () => {
    if (!user) {
      toast.error('Please login to register for this event');
      navigate('/login', { state: { from: { pathname: `/events/${eventId}/register` } } });
      return;
    }
    navigate(`/events/${eventId}/register`);
  };

  const isRegistrationOpen = () => {
    if (!event) return false;
    const now = new Date();
    const regStart = event.registrationStart?.toDate?.() || new Date(event.registrationStart);
    const regEnd = event.registrationEnd?.toDate?.() || new Date(event.registrationEnd);
    return now >= regStart && now <= regEnd;
  };

  const isFull = () => {
    if (!event) return false;
    return event.currentCount >= event.maxParticipants;
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Banner */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="primary">{event.category}</Badge>
              <Badge variant={event.type === 'online' ? 'info' : 'success'}>
                {event.type === 'online' ? 'Online Event' : 'Offline Event'}
              </Badge>
              {event.status === 'published' && (
                <Badge variant="success" dot>Live</Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <Card>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Date</p>
                    <p className="font-medium text-text-primary">{formatShortDate(event.eventDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Time</p>
                    <p className="font-medium text-text-primary">{event.startTime} - {event.endTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Location</p>
                    <p className="font-medium text-text-primary">
                      {event.type === 'online' ? 'Online' : event.venue || 'TBA'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Capacity</p>
                    <p className="font-medium text-text-primary">
                      {event.currentCount || 0}/{event.maxParticipants}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <h2 className="text-xl font-semibold text-text-primary mb-4">About This Event</h2>
              <div className="prose prose-sm max-w-none text-text-secondary">
                {event.description?.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </Card>

            {/* Additional Details */}
            {(event.venue || event.type === 'online') && (
              <Card>
                <h2 className="text-xl font-semibold text-text-primary mb-4">
                  {event.type === 'online' ? 'How to Join' : 'Venue Details'}
                </h2>
                {event.type === 'online' ? (
                  <div className="space-y-3">
                    <p className="text-text-secondary">
                      This is an online event. Meeting link will be shared with registered participants.
                    </p>
                    <div className="flex items-center gap-2 text-primary">
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">Link will be available after registration</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-text-primary">{event.venue}</p>
                        {event.venueAddress && (
                          <p className="text-sm text-text-secondary">{event.venueAddress}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="sticky top-24">
              <div className="text-center mb-6">
                {event.fee > 0 ? (
                  <div>
                    <span className="text-4xl font-bold text-text-primary">₹{event.fee}</span>
                    <span className="text-text-secondary">/person</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-success">Free Event</div>
                )}
              </div>

              {/* Registration Status */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Registration Opens</span>
                  <span className="font-medium text-text-primary">
                    {formatShortDate(event.registrationStart)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Registration Closes</span>
                  <span className="font-medium text-text-primary">
                    {formatShortDate(event.registrationEnd)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Spots Available</span>
                  <span className="font-medium text-text-primary">
                    {event.maxParticipants - (event.currentCount || 0)} left
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{
                        width: `${((event.currentCount || 0) / event.maxParticipants) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-1 text-center">
                    {event.currentCount || 0} of {event.maxParticipants} spots filled
                  </p>
                </div>
              </div>

              {/* Registration Button */}
              {isFull() ? (
                <div className="bg-error-light rounded-lg p-4 text-center">
                  <AlertCircle className="w-6 h-6 text-error mx-auto mb-2" />
                  <p className="font-medium text-error">Registration Full</p>
                  <p className="text-sm text-error/70">No spots available</p>
                </div>
              ) : !isRegistrationOpen() ? (
                <div className="bg-warning-light rounded-lg p-4 text-center">
                  <AlertCircle className="w-6 h-6 text-warning mx-auto mb-2" />
                  <p className="font-medium text-yellow-700">Registration Closed</p>
                  <p className="text-sm text-yellow-600">Check back later</p>
                </div>
              ) : (
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleRegister}
                >
                  Register Now
                </Button>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  fullWidth
                  icon={Share2}
                  onClick={handleShare}
                >
                  Share
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  icon={Heart}
                >
                  Save
                </Button>
              </div>

              {/* Info */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                  <span>Instant confirmation & QR entry pass</span>
                </div>
                {event.fee > 0 && (
                  <div className="flex items-start gap-2 text-sm text-text-secondary mt-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    <span>Secure payment via Razorpay</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
