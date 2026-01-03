import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Heart,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Tag,
  Globe,
  Building
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    fetchEvent();
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const formatShortDate = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return '-';
    }
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
    try {
      const now = new Date();
      const regStart = event.registrationStart?.toDate?.() || new Date(event.registrationStart);
      const regEnd = event.registrationEnd?.toDate?.() || new Date(event.registrationEnd);
      return now >= regStart && now <= regEnd;
    } catch {
      return true;
    }
  };

  const isFull = () => {
    if (!event) return false;
    return (event.currentCount || 0) >= (event.maxParticipants || 100);
  };

  const getProgressPercentage = () => {
    if (!event || !event.maxParticipants) return 0;
    return Math.min(100, ((event.currentCount || 0) / event.maxParticipants) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #F1F5F9',
            borderTopColor: '#E91E63',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ color: '#64748B', margin: 0 }}>Loading event details...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  // Info Card Component
  const InfoCard = ({ icon: Icon, label, value, color }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: '#F8FAFC',
      borderRadius: '0.75rem',
    }}>
      <div style={{
        width: '2.5rem',
        height: '2.5rem',
        backgroundColor: `${color}15`,
        borderRadius: '0.625rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: '1.125rem', height: '1.125rem', color }} />
      </div>
      <div style={{ overflow: 'hidden' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>{label}</p>
        <p style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#1E293B',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '2rem' }}>
      {/* Banner */}
      <div style={{
        position: 'relative',
        height: '300px',
        overflow: 'hidden',
      }}>
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1E3A5F 0%, #E91E63 100%)',
          }} />
        )}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
        }} />

        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#FFFFFF',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#1E293B',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10,
          }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back
        </button>

        {/* Banner Content */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1.5rem',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: '#E91E63',
                color: '#FFFFFF',
              }}>
                <Tag style={{ width: '0.75rem', height: '0.75rem' }} />
                {event.category || 'Event'}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: event.type === 'online' ? '#3B82F6' : '#10B981',
                color: '#FFFFFF',
              }}>
                {event.type === 'online' ? (
                  <><Globe style={{ width: '0.75rem', height: '0.75rem' }} /> Online</>
                ) : (
                  <><Building style={{ width: '0.75rem', height: '0.75rem' }} /> Offline</>
                )}
              </span>
            </div>
            <h1 style={{
              fontSize: isMobile ? '1.5rem' : '1.75rem',
              fontWeight: '700',
              color: '#FFFFFF',
              margin: 0,
              lineHeight: 1.3,
            }}>{event.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '1.5rem',
        }}>
          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Quick Info Grid */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '0.75rem',
              }}>
                <InfoCard
                  icon={Calendar}
                  label="Date"
                  value={formatShortDate(event.eventDate)}
                  color="#E91E63"
                />
                <InfoCard
                  icon={Clock}
                  label="Time"
                  value={`${event.startTime || '-'} - ${event.endTime || '-'}`}
                  color="#8B5CF6"
                />
                <InfoCard
                  icon={MapPin}
                  label="Location"
                  value={event.type === 'online' ? 'Online Event' : (event.venue || 'TBA')}
                  color="#3B82F6"
                />
                <InfoCard
                  icon={Users}
                  label="Capacity"
                  value={`${event.currentCount || 0} / ${event.maxParticipants || '-'}`}
                  color="#10B981"
                />
              </div>
            </div>

            {/* About Section */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1E293B', margin: '0 0 1rem' }}>
                About This Event
              </h2>
              <div style={{ fontSize: '0.9375rem', color: '#64748B', lineHeight: 1.7 }}>
                {event.description ? (
                  event.description.split('\n').map((paragraph, index) => (
                    <p key={index} style={{ margin: index === 0 ? 0 : '0.75rem 0 0' }}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p style={{ margin: 0, fontStyle: 'italic' }}>No description available.</p>
                )}
              </div>
            </div>

            {/* Venue/Join Section */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1E293B', margin: '0 0 1rem' }}>
                {event.type === 'online' ? 'How to Join' : 'Venue Details'}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '0.75rem',
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  backgroundColor: event.type === 'online' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '0.625rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {event.type === 'online' ? (
                    <ExternalLink style={{ width: '1.125rem', height: '1.125rem', color: '#3B82F6' }} />
                  ) : (
                    <MapPin style={{ width: '1.125rem', height: '1.125rem', color: '#E91E63' }} />
                  )}
                </div>
                <div>
                  {event.type === 'online' ? (
                    <>
                      <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.25rem' }}>
                        Online Event
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                        Meeting link will be shared with registered participants via email.
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.25rem' }}>
                        {event.venue || 'Venue TBA'}
                      </p>
                      {event.venueAddress && (
                        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                          {event.venueAddress}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: isMobile ? '100%' : '340px', flexShrink: 0 }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              position: isMobile ? 'relative' : 'sticky',
              top: '1rem',
            }}>
              {/* Price */}
              <div style={{
                textAlign: 'center',
                marginBottom: '1.25rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid #F1F5F9',
              }}>
                {event.fee > 0 ? (
                  <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                    Rs.{event.fee}
                    <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '400' }}>/person</span>
                  </p>
                ) : (
                  <span style={{
                    display: 'inline-block',
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    borderRadius: '2rem',
                    fontSize: '1.125rem',
                    fontWeight: '700',
                  }}>Free Event</span>
                )}
              </div>

              {/* Registration Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>Registration Opens</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B' }}>
                    {formatShortDate(event.registrationStart)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>Registration Closes</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B' }}>
                    {formatShortDate(event.registrationEnd)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>Spots Available</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#E91E63' }}>
                    {(event.maxParticipants || 0) - (event.currentCount || 0)} left
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{
                  height: '6px',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#E91E63',
                    borderRadius: '3px',
                    width: `${getProgressPercentage()}%`,
                  }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'center', marginTop: '0.5rem' }}>
                  {event.currentCount || 0} of {event.maxParticipants || 0} spots filled
                </p>
              </div>

              {/* Registration Button */}
              {isFull() ? (
                <div style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                }}>
                  <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#EF4444', marginBottom: '0.25rem' }} />
                  <p style={{ fontWeight: '600', color: '#EF4444', margin: 0, fontSize: '0.9375rem' }}>Registration Full</p>
                </div>
              ) : !isRegistrationOpen() ? (
                <div style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FDE68A',
                }}>
                  <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#D97706', marginBottom: '0.25rem' }} />
                  <p style={{ fontWeight: '600', color: '#D97706', margin: 0, fontSize: '0.9375rem' }}>Registration Closed</p>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    backgroundColor: '#E91E63',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Register Now
                </button>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  onClick={handleShare}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.625rem',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.625rem',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  <Share2 style={{ width: '0.875rem', height: '0.875rem' }} />
                  Share
                </button>
                <button
                  onClick={() => setLiked(!liked)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.625rem',
                    backgroundColor: liked ? '#FEF2F2' : '#FFFFFF',
                    color: liked ? '#EF4444' : '#64748B',
                    border: `1px solid ${liked ? '#FECACA' : '#E2E8F0'}`,
                    borderRadius: '0.625rem',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  <Heart style={{ width: '0.875rem', height: '0.875rem', fill: liked ? '#EF4444' : 'none' }} />
                  {liked ? 'Saved' : 'Save'}
                </button>
              </div>

              {/* Features */}
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
                  <CheckCircle style={{ width: '0.875rem', height: '0.875rem', color: '#10B981', flexShrink: 0 }} />
                  Instant confirmation & QR pass
                </div>
                {event.fee > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
                    <CheckCircle style={{ width: '0.875rem', height: '0.875rem', color: '#10B981', flexShrink: 0 }} />
                    Secure payment via Razorpay
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
                  <CheckCircle style={{ width: '0.875rem', height: '0.875rem', color: '#10B981', flexShrink: 0 }} />
                  Email reminder before event
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EventDetails;
