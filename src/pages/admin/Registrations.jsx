import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  ClipboardList,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  QrCode,
  Calendar,
  Users,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

const Registrations = () => {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    // Fetch events first
    const eventsRef = collection(db, 'events');
    const eventsUnsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
    });

    // Fetch all registrations
    const registrationsRef = collection(db, 'registrations');
    const regUnsubscribe = onSnapshot(registrationsRef, (snapshot) => {
      const regsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      regsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date();
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
        return dateB - dateA;
      });
      setRegistrations(regsData);
      setLoading(false);
    });

    return () => {
      eventsUnsubscribe();
      regUnsubscribe();
    };
  }, []);

  // Filter registrations
  useEffect(() => {
    let filtered = [...registrations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.registrationId?.toLowerCase().includes(term) ||
        r.departmentName?.toLowerCase().includes(term) ||
        r.eventTitle?.toLowerCase().includes(term) ||
        r.students?.some(s => s.name?.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (eventFilter !== 'all') {
      filtered = filtered.filter(r => r.eventId === eventFilter);
    }

    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm, statusFilter, eventFilter]);

  const generateEventToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let token = 'EVT-';
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const handleApprove = async (registration) => {
    setProcessing(registration.id);
    try {
      const eventToken = generateEventToken();
      await updateDoc(doc(db, 'registrations', registration.id), {
        status: 'approved',
        eventToken,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Registration approved and token generated');
    } catch (error) {
      console.error('Error approving registration:', error);
      toast.error('Failed to approve registration');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (registration) => {
    if (!window.confirm('Are you sure you want to reject this registration?')) return;

    setProcessing(registration.id);
    try {
      await updateDoc(doc(db, 'registrations', registration.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Registration rejected');
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast.error('Failed to reject registration');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { bg: '#D1FAE5', color: '#059669', icon: CheckCircle };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#DC2626', icon: XCircle };
      default:
        return { bg: '#FEF3C7', color: '#D97706', icon: AlertCircle };
    }
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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
      {/* Header */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
          Event Registrations
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
          Approve or reject department registrations and generate event tokens
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ ...cardStyle, borderLeft: '4px solid #3B82F6' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Total</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{registrations.length}</p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #F59E0B' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Pending</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {registrations.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #10B981' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Approved</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {registrations.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #EF4444' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Rejected</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {registrations.filter(r => r.status === 'rejected').length}
          </p>
        </div>
      </div>

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
              placeholder="Search registrations..."
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer',
              maxWidth: '200px',
            }}
          >
            <option value="all">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <ClipboardList style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem', color: '#64748B', margin: 0 }}>No registrations found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRegistrations.map((reg) => {
            const status = getStatusStyle(reg.status);
            const StatusIcon = status.icon;
            const createdAt = reg.createdAt?.toDate ? reg.createdAt.toDate() : new Date();

            return (
              <div key={reg.id} style={cardStyle}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                        {reg.eventTitle}
                      </h4>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.625rem',
                        backgroundColor: status.bg,
                        color: status.color,
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                      }}>
                        <StatusIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                        {reg.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Building2 style={{ width: '0.875rem', height: '0.875rem' }} />
                        {reg.departmentName} ({reg.departmentCode})
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                        {format(createdAt, 'MMM dd, yyyy')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users style={{ width: '0.875rem', height: '0.875rem' }} />
                        {reg.students?.length || 1} student(s)
                      </span>
                    </div>

                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem',
                    }}>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.25rem 0' }}>Students:</p>
                      <p style={{ fontSize: '0.8125rem', color: '#1E293B', margin: 0 }}>
                        {reg.students?.map(s => `${s.name} (${s.registerNumber})`).join(', ')}
                      </p>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                      Registration ID: {reg.registrationId}
                    </p>

                    {reg.eventToken && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#D1FAE5',
                        borderRadius: '0.5rem',
                      }}>
                        <QrCode style={{ width: '1rem', height: '1rem', color: '#059669' }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#059669', fontFamily: 'monospace' }}>
                          {reg.eventToken}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedRegistration(reg)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.875rem',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        color: '#1E293B',
                      }}
                    >
                      <Eye style={{ width: '0.875rem', height: '0.875rem' }} />
                      View
                    </button>
                    {reg.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(reg)}
                          disabled={processing === reg.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 0.875rem',
                            backgroundColor: '#10B981',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: processing === reg.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.8125rem',
                            color: '#FFFFFF',
                            opacity: processing === reg.id ? 0.7 : 1,
                          }}
                        >
                          <CheckCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(reg)}
                          disabled={processing === reg.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 0.875rem',
                            backgroundColor: '#EF4444',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: processing === reg.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.8125rem',
                            color: '#FFFFFF',
                            opacity: processing === reg.id ? 0.7 : 1,
                          }}
                        >
                          <XCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Details Modal */}
      {selectedRegistration && (
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
          onClick={() => setSelectedRegistration(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
                  Registration Details
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                  ID: {selectedRegistration.registrationId}
                </p>
              </div>
              <button
                onClick={() => setSelectedRegistration(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X style={{ width: '1.5rem', height: '1.5rem', color: '#64748B' }} />
              </button>
            </div>

            {/* Event Info */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
                {selectedRegistration.eventTitle}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                Category: {selectedRegistration.eventCategory}
              </p>
            </div>

            {/* Department Info */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Department
              </p>
              <p style={{ fontSize: '0.9375rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                {selectedRegistration.departmentName} ({selectedRegistration.departmentCode})
              </p>
            </div>

            {/* Students */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.75rem 0', textTransform: 'uppercase' }}>
                Registered Students
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedRegistration.students?.map((student, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '0.5rem',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                      {student.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                      {student.registerNumber} | Year {student.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Details */}
            {selectedRegistration.performanceDetails && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.75rem 0', textTransform: 'uppercase' }}>
                  Performance Details
                </p>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '0.5rem',
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Type</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0, textTransform: 'capitalize' }}>
                        {selectedRegistration.performanceDetails.performanceType}
                      </p>
                    </div>
                    {selectedRegistration.performanceDetails.teamName && (
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Team Name</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                          {selectedRegistration.performanceDetails.teamName}
                        </p>
                      </div>
                    )}
                    {selectedRegistration.performanceDetails.songName && (
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Song/Performance</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                          {selectedRegistration.performanceDetails.songName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Event Token QR Code */}
            {selectedRegistration.eventToken && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.75rem 0', textTransform: 'uppercase' }}>
                  Event Token
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '1rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '0.75rem',
                  border: '2px solid #E2E8F0',
                }}>
                  <QRCodeSVG
                    value={selectedRegistration.eventToken}
                    size={150}
                    level="H"
                    includeMargin
                  />
                </div>
                <p style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1E3A5F',
                  margin: '0.75rem 0 0 0',
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                }}>
                  {selectedRegistration.eventToken}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {selectedRegistration.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => {
                    handleApprove(selectedRegistration);
                    setSelectedRegistration(null);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                  }}
                >
                  <CheckCircle style={{ width: '1.125rem', height: '1.125rem' }} />
                  Approve & Generate Token
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedRegistration);
                    setSelectedRegistration(null);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                  }}
                >
                  <XCircle style={{ width: '1.125rem', height: '1.125rem' }} />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Registrations;
