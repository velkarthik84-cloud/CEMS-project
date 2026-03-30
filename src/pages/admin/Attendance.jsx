import { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Users,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedEventData, setSelectedEventData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [checkedIn, setCheckedIn] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [loading, setLoading] = useState(true);

  const scannerRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchRegistrations();
    }
  }, [selectedEvent]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('status', 'in', ['published', 'closed']));
      const snapshot = await getDocs(q);

      const eventsList = snapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().title,
        ...doc.data()
      }));

      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const eventData = events.find(e => e.value === selectedEvent);
      setSelectedEventData(eventData);

      const regsRef = collection(db, 'registrations');
      const q = query(regsRef, where('eventId', '==', selectedEvent));
      const snapshot = await getDocs(q);

      const regsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRegistrations(regsList);
      setCheckedIn(regsList.filter(r => r.attendanceStatus === 'checked_in'));
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const startScanner = () => {
    setScanning(true);
    setLastScanned(null);

    setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    try {
      const parts = decodedText.split(':');

      if (parts[0] !== 'CEMS') {
        toast.error('Invalid QR code');
        return;
      }

      const [, eventId, registrationId] = parts;

      if (eventId !== selectedEvent) {
        toast.error('QR code is for a different event');
        return;
      }

      const registration = registrations.find(
        r => r.registrationId === registrationId || r.id === registrationId
      );

      if (!registration) {
        toast.error('Registration not found');
        setLastScanned({ success: false, message: 'Registration not found' });
        return;
      }

      if (registration.attendanceStatus === 'checked_in') {
        toast.error('Already checked in!');
        setLastScanned({
          success: false,
          message: 'Already checked in',
          participant: registration
        });
        return;
      }

      await updateDoc(doc(db, 'registrations', registration.id), {
        attendanceStatus: 'checked_in',
        checkedInAt: serverTimestamp(),
      });

      const updatedReg = {
        ...registration,
        attendanceStatus: 'checked_in',
        checkedInAt: new Date()
      };

      setRegistrations(registrations.map(r =>
        r.id === registration.id ? updatedReg : r
      ));

      setCheckedIn([...checkedIn, updatedReg]);

      toast.success(`${registration.fullName} checked in!`);

      setLastScanned({
        success: true,
        message: 'Check-in successful!',
        participant: updatedReg
      });

      const audio = new Audio('/success.mp3');
      audio.play().catch(() => {});

    } catch (error) {
      console.error('Error processing scan:', error);
      toast.error('Failed to process check-in');
      setLastScanned({ success: false, message: 'Failed to process' });
    }
  };

  const onScanError = () => {};

  const manualCheckIn = async (registration) => {
    try {
      await updateDoc(doc(db, 'registrations', registration.id), {
        attendanceStatus: 'checked_in',
        checkedInAt: serverTimestamp(),
      });

      const updatedReg = {
        ...registration,
        attendanceStatus: 'checked_in',
        checkedInAt: new Date()
      };

      setRegistrations(registrations.map(r =>
        r.id === registration.id ? updatedReg : r
      ));

      setCheckedIn([...checkedIn, updatedReg]);

      toast.success(`${registration.fullName} checked in!`);
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.875rem',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  const statCardStyle = {
    ...cardStyle,
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  };

  const selectStyle = {
    padding: '0.625rem 2rem 0.625rem 1rem',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#1E293B',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    minWidth: '200px',
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    backgroundColor: '#E91E63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  };

  const outlineButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#FFFFFF',
    color: '#64748B',
    border: '1px solid #E2E8F0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>Attendance</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Scan QR codes to mark attendance
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <select
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              if (scanning) stopScanner();
            }}
            style={selectStyle}
          >
            <option value="">Select Event</option>
            {events.map(event => (
              <option key={event.value} value={event.value}>{event.label}</option>
            ))}
          </select>

          <ChevronDown style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1rem',
            height: '1rem',
            color: '#94A3B8',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {selectedEvent ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2" style={{ gap: '1.25rem' }}>
            <div style={statCardStyle}>
              <div style={{
                width: '2.75rem',
                height: '2.75rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users style={{ width: '1.25rem', height: '1.25rem', color: '#8B5CF6' }} />
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                  {registrations.length}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Total Registered</p>
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={{
                width: '2.75rem',
                height: '2.75rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                  {checkedIn.length}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Checked In</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '1.5rem' }}>
            {/* Scanner */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>QR Scanner</h2>

                {scanning ? (
                  <button onClick={stopScanner} style={outlineButtonStyle}>
                    Stop Scanner
                  </button>
                ) : (
                  <button onClick={startScanner} style={buttonStyle}>
                    <Camera style={{ width: '1rem', height: '1rem' }} />
                    Start Scanner
                  </button>
                )}
              </div>

              {scanning ? (
                <div>
                  <div id="qr-reader" style={{ width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }} />

                  {lastScanned && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      backgroundColor: lastScanned.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {lastScanned.success ? (
                          <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
                        ) : (
                          <XCircle style={{ width: '1.5rem', height: '1.5rem', color: '#EF4444' }} />
                        )}

                        <div>
                          <p style={{
                            fontWeight: '500',
                            color: lastScanned.success ? '#059669' : '#DC2626',
                            margin: 0,
                          }}>
                            {lastScanned.message}
                          </p>

                          {lastScanned.participant && (
                            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                              {lastScanned.participant.fullName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center' }}>
                  <div style={{
                    width: '5rem',
                    height: '5rem',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}>
                    <QrCode style={{ width: '2.5rem', height: '2.5rem', color: '#94A3B8' }} />
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
                    Click "Start Scanner" to scan participant QR codes
                  </p>

                  <button onClick={startScanner} style={buttonStyle}>
                    <Camera style={{ width: '1rem', height: '1rem' }} />
                    Start Scanner
                  </button>
                </div>
              )}
            </div>

            {/* Recent Check-ins */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                  Recent Check-ins
                </h2>

                <button onClick={fetchRegistrations} style={outlineButtonStyle}>
                  <RefreshCw style={{ width: '0.875rem', height: '0.875rem' }} />
                  Refresh
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                {checkedIn.length > 0 ? (
                  checkedIn
                    .sort((a, b) => (b.checkedInAt?.toDate?.() || 0) - (a.checkedInAt?.toDate?.() || 0))
                    .slice(0, 10)
                    .map((reg) => (
                      <div
                        key={reg.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.875rem',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
                          </div>

                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                              {reg.fullName}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                              {reg.email}
                            </p>
                          </div>
                        </div>

                        <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                          {formatTime(reg.checkedInAt)}
                        </span>
                      </div>
                    ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>
                    No check-ins yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* All Participants */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                All Participants
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Participant</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Contact</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Attendance</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Check-in</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {registrations.map((reg, index) => (
                    <tr key={reg.id} style={{ borderBottom: index < registrations.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            backgroundColor: reg.attendanceStatus === 'checked_in'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{
                              fontSize: '0.8125rem',
                              fontWeight: '500',
                              color: reg.attendanceStatus === 'checked_in'
                                ? '#10B981'
                                : '#94A3B8',
                            }}>
                              {reg.fullName?.[0]?.toUpperCase()}
                            </span>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', display: 'block' }}>
                              {reg.fullName}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                              {reg.registrationId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#64748B' }}>
                        {reg.mobile}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        {reg.attendanceStatus === 'checked_in' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#10B981' }}>
                            <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                            Present
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#94A3B8' }}>
                            <XCircle style={{ width: '1rem', height: '1rem' }} />
                            Absent
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', color: '#64748B' }}>
                        {formatTime(reg.checkedInAt)}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {reg.attendanceStatus !== 'checked_in' && (
                            <button
                              onClick={() => manualCheckIn(reg)}
                              style={{ ...outlineButtonStyle, padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                            >
                              Check In
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </>
      ) : (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <QrCode style={{ width: '4rem', height: '4rem', color: '#CBD5E1', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', marginBottom: '0.5rem' }}>
            Select an Event
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Choose an event from the dropdown to start taking attendance
          </p>
        </div>
      )}
    </div>
  );
};

export default Attendance;
