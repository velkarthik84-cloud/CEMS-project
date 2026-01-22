import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  QrCode,
  Calendar,
  Users,
  Music,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

const MyRegistrations = () => {
  const { departmentSession } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!departmentSession?.departmentId) return;

    // Set up real-time listener for registrations
    const registrationsRef = collection(db, 'registrations');
    const regQuery = query(
      registrationsRef,
      where('departmentId', '==', departmentSession.departmentId)
    );

    const unsubscribe = onSnapshot(regQuery, (snapshot) => {
      const regsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by creation date (newest first)
      regsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
      setRegistrations(regsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [departmentSession]);

  // Filter registrations
  useEffect(() => {
    let filtered = [...registrations];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    setFilteredRegistrations(filtered);
  }, [registrations, statusFilter]);

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
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ ...cardStyle, borderLeft: '4px solid #3B82F6' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Total</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {registrations.length}
          </p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #F59E0B' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Pending</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {registrations.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #10B981' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Approved</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {registrations.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #EF4444' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Rejected</p>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {registrations.filter(r => r.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
            My Registrations
          </h3>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                color: '#1E293B',
              }}
            >
              <Filter style={{ width: '1rem', height: '1rem' }} />
              {statusFilter === 'all' ? 'All Status' : statusFilter}
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
                minWidth: '150px',
              }}>
                {['all', 'pending', 'approved', 'rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setShowFilters(false); }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      textAlign: 'left',
                      backgroundColor: statusFilter === status ? '#F8FAFC' : 'transparent',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      color: '#1E293B',
                      textTransform: 'capitalize',
                    }}
                  >
                    {status === 'all' ? 'All Status' : status}
                  </button>
                ))}
              </div>
            )}
          </div>
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
            const createdAt = reg.createdAt?.toDate ? reg.createdAt.toDate() : new Date(reg.createdAt);

            return (
              <div key={reg.id} style={cardStyle}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#64748B' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                        {format(createdAt, 'MMM dd, yyyy')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users style={{ width: '0.875rem', height: '0.875rem' }} />
                        {reg.students?.length || 1} student(s)
                      </span>
                      {reg.performanceDetails?.performanceType && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Music style={{ width: '0.875rem', height: '0.875rem' }} />
                          {reg.performanceDetails.performanceType}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0.5rem 0 0 0' }}>
                      Registration ID: {reg.registrationId}
                    </p>
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
                    {reg.status === 'approved' && reg.eventToken && (
                      <button
                        onClick={() => { setSelectedRegistration(reg); setShowQRModal(true); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.5rem 0.875rem',
                          backgroundColor: '#E91E63',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          color: '#FFFFFF',
                        }}
                      >
                        <QrCode style={{ width: '0.875rem', height: '0.875rem' }} />
                        Token
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Details Modal */}
      {selectedRegistration && !showQRModal && (
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
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
                {selectedRegistration.eventTitle}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                Category: {selectedRegistration.eventCategory}
              </p>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Status
              </p>
              {(() => {
                const status = getStatusStyle(selectedRegistration.status);
                const StatusIcon = status.icon;
                return (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: status.bg,
                    color: status.color,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                  }}>
                    <StatusIcon style={{ width: '1rem', height: '1rem' }} />
                    {selectedRegistration.status}
                  </span>
                );
              })()}
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
                    {selectedRegistration.performanceDetails.duration && (
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Duration</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                          {selectedRegistration.performanceDetails.duration}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Event Token (if approved) */}
            {selectedRegistration.status === 'approved' && selectedRegistration.eventToken && (
              <button
                onClick={() => setShowQRModal(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem',
                  backgroundColor: '#E91E63',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                }}
              >
                <QrCode style={{ width: '1.25rem', height: '1.25rem' }} />
                View Event Token
              </button>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedRegistration && showQRModal && (
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
          onClick={() => { setShowQRModal(false); setSelectedRegistration(null); }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '400px',
              padding: '2rem',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setShowQRModal(false); setSelectedRegistration(null); }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '1.5rem', height: '1.5rem', color: '#64748B' }} />
            </button>

            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
              Event Token
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 1.5rem 0' }}>
              Show this QR code at the event venue
            </p>

            <div style={{
              display: 'inline-block',
              padding: '1rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '0.75rem',
              border: '2px solid #E2E8F0',
              marginBottom: '1rem',
            }}>
              <QRCodeSVG
                value={selectedRegistration.eventToken}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            <p style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1E3A5F',
              margin: '0 0 0.25rem 0',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
            }}>
              {selectedRegistration.eventToken}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
              {selectedRegistration.eventTitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
