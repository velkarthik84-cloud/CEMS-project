import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Building2,
  ChevronRight,
  ArrowLeft,
  Mail,
  Phone,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Participants = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('events'); // 'events' | 'departments' | 'participants'

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsRef = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsRef);
      const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get registration counts per event
      const regsRef = collection(db, 'registrations');
      const regsSnapshot = await getDocs(regsRef);
      const registrations = regsSnapshot.docs.map(doc => doc.data());

      const eventsWithCounts = eventsList.map(event => ({
        ...event,
        registrationCount: registrations.filter(r => r.eventId === event.id).length,
      }));

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsForEvent = async (event) => {
    try {
      setLoading(true);
      setSelectedEvent(event);

      const regsRef = collection(db, 'registrations');
      const q = query(regsRef, where('eventId', '==', event.id));
      const regsSnapshot = await getDocs(q);

      // Group by department
      const deptMap = new Map();
      regsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const deptId = data.departmentId || 'unknown';
        if (!deptMap.has(deptId)) {
          deptMap.set(deptId, {
            departmentId: deptId,
            departmentName: data.departmentName || 'Unknown Department',
            departmentCode: data.departmentCode || '-',
            count: 0,
          });
        }
        deptMap.get(deptId).count++;
      });

      setDepartments(Array.from(deptMap.values()));
      setView('departments');
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (department) => {
    try {
      setLoading(true);
      setSelectedDepartment(department);

      const regsRef = collection(db, 'registrations');
      const q = query(
        regsRef,
        where('eventId', '==', selectedEvent.id),
        where('departmentId', '==', department.departmentId)
      );
      const snapshot = await getDocs(q);
      setParticipants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setView('participants');
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const goBackToEvents = () => {
    setSelectedEvent(null);
    setSelectedDepartment(null);
    setDepartments([]);
    setParticipants([]);
    setView('events');
  };

  const goBackToDepartments = () => {
    setSelectedDepartment(null);
    setParticipants([]);
    setView('departments');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  if (loading && view === 'events' && events.length === 0) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
          Participants
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
          View participants by event and department
        </p>
      </div>

      {/* Breadcrumb Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#F8FAFC',
        borderRadius: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={goBackToEvents}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: view === 'events' ? '#1E293B' : '#E91E63',
            fontWeight: view === 'events' ? '600' : '500',
            fontSize: '0.875rem',
            padding: 0,
          }}
        >
          Events
        </button>
        {selectedEvent && (
          <>
            <ChevronRight style={{ width: '1rem', height: '1rem', color: '#94A3B8' }} />
            <button
              onClick={goBackToDepartments}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: view === 'departments' ? '#1E293B' : '#E91E63',
                fontWeight: view === 'departments' ? '600' : '500',
                fontSize: '0.875rem',
                padding: 0,
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedEvent.title}
            </button>
          </>
        )}
        {selectedDepartment && (
          <>
            <ChevronRight style={{ width: '1rem', height: '1rem', color: '#94A3B8' }} />
            <span style={{ color: '#1E293B', fontWeight: '600', fontSize: '0.875rem' }}>
              {selectedDepartment.departmentName}
            </span>
          </>
        )}
      </nav>

      {/* Events Grid (Level 1) */}
      {view === 'events' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: '1.5rem' }}>
          {events.length === 0 ? (
            <div style={{ ...cardStyle, gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <Calendar style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '1rem', color: '#64748B', margin: 0 }}>No events found</p>
            </div>
          ) : (
            events.map(event => (
              <div
                key={event.id}
                onClick={() => fetchDepartmentsForEvent(event)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ height: '140px', position: 'relative', backgroundColor: '#F1F5F9' }}>
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    }}>
                      <Calendar style={{ width: '3rem', height: '3rem', color: '#FFFFFF' }} />
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    backgroundColor: '#E91E63',
                    color: '#FFFFFF',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.6875rem',
                    fontWeight: '600',
                  }}>
                    {event.category || 'Event'}
                  </div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1E293B',
                    margin: '0 0 0.5rem 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {event.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                    <span style={{ fontSize: '0.875rem', color: '#64748B' }}>
                      {event.registrationCount} Registrations
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Departments List (Level 2) */}
      {view === 'departments' && (
        <div>
          <button
            onClick={goBackToEvents}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#64748B',
              cursor: 'pointer',
              marginBottom: '1.5rem',
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back to Events
          </button>

          <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
              {selectedEvent?.title}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
              {departments.length} department(s) registered
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading departments...</div>
          ) : departments.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
              <Building2 style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '1rem', color: '#64748B', margin: 0 }}>No departments registered for this event</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {departments.map(dept => (
                <div
                  key={dept.departmentId}
                  onClick={() => fetchParticipants(dept)}
                  style={{
                    ...cardStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: '1.25rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E91E63';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.75rem',
                      backgroundColor: 'rgba(233, 30, 99, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Building2 style={{ width: '1.5rem', height: '1.5rem', color: '#E91E63' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
                        {dept.departmentName}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                        Code: {dept.departmentCode}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      padding: '0.375rem 0.875rem',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#8B5CF6',
                    }}>
                      {dept.count} participant(s)
                    </div>
                    <ChevronRight style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Participants Table (Level 3) */}
      {view === 'participants' && (
        <div>
          <button
            onClick={goBackToDepartments}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#64748B',
              cursor: 'pointer',
              marginBottom: '1.5rem',
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back to Departments
          </button>

          <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
              {selectedEvent?.title} - {selectedDepartment?.departmentName}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
              {participants.length} participant(s)
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading participants...</div>
          ) : participants.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
              <Users style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '1rem', color: '#64748B', margin: 0 }}>No participants found</p>
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                        Student(s)
                      </th>
                      <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                        Registration ID
                      </th>
                      <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                        Contact
                      </th>
                      <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                        Status
                      </th>
                      <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr key={participant.id} style={{ borderBottom: index < participants.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div style={{
                              width: '2.5rem',
                              height: '2.5rem',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              fontWeight: '600',
                              fontSize: '0.875rem',
                              flexShrink: 0,
                            }}>
                              {participant.students?.[0]?.name?.[0]?.toUpperCase() || participant.fullName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              {participant.students?.length > 0 ? (
                                participant.students.map((student, idx) => (
                                  <div key={idx} style={{ marginBottom: idx < participant.students.length - 1 ? '0.5rem' : 0 }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                                      {student.name}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                                      {student.registerNumber}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                                  {participant.fullName || '-'}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            padding: '0.25rem 0.625rem',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '0.375rem',
                            fontSize: '0.8125rem',
                            fontFamily: 'monospace',
                            color: '#64748B',
                          }}>
                            {participant.registrationId}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {(participant.email || participant.students?.[0]?.email) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
                                <Mail style={{ width: '0.875rem', height: '0.875rem' }} />
                                {participant.email || participant.students?.[0]?.email}
                              </div>
                            )}
                            {(participant.mobile || participant.students?.[0]?.phone) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
                                <Phone style={{ width: '0.875rem', height: '0.875rem' }} />
                                {participant.mobile || participant.students?.[0]?.phone}
                              </div>
                            )}
                            {!participant.email && !participant.mobile && !participant.students?.[0]?.email && !participant.students?.[0]?.phone && (
                              <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>-</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: participant.status === 'approved'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : participant.status === 'rejected'
                                ? 'rgba(239, 68, 68, 0.1)'
                                : 'rgba(245, 158, 11, 0.1)',
                            color: participant.status === 'approved'
                              ? '#10B981'
                              : participant.status === 'rejected'
                                ? '#EF4444'
                                : '#F59E0B',
                          }}>
                            {participant.status?.charAt(0).toUpperCase() + participant.status?.slice(1) || 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                            {formatDate(participant.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Participants;
