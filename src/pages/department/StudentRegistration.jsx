import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  UserPlus,
  Calendar,
  Users,
  Trash2,
  Plus,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Music,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const StudentRegistration = () => {
  const { departmentSession } = useOutletContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [students, setStudents] = useState([{
    name: '',
    registerNumber: '',
    year: '',
    email: '',
    phone: '',
  }]);
  const [performanceDetails, setPerformanceDetails] = useState({
    songName: '',
    performanceType: 'solo',
    teamName: '',
    duration: '',
    specialRequirements: '',
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(eventsRef, where('status', '==', 'published'));
        const snapshot = await getDocs(eventsQuery);
        const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter future events
        const now = new Date();
        const futureEvents = eventsData.filter(e => {
          const eventDate = e.eventDate?.toDate ? e.eventDate.toDate() : new Date(e.eventDate);
          return eventDate >= now;
        }).sort((a, b) => {
          const dateA = a.eventDate?.toDate ? a.eventDate.toDate() : new Date(a.eventDate);
          const dateB = b.eventDate?.toDate ? b.eventDate.toDate() : new Date(b.eventDate);
          return dateA - dateB;
        });

        setEvents(futureEvents);

        // Pre-select event from URL params
        const eventId = searchParams.get('eventId');
        if (eventId) {
          const event = futureEvents.find(e => e.id === eventId);
          if (event) setSelectedEvent(event);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchParams]);

  const handleStudentChange = (index, field, value) => {
    const updatedStudents = [...students];
    updatedStudents[index][field] = value;
    setStudents(updatedStudents);
  };

  const addStudent = () => {
    if (selectedEvent?.categoryDetails?.performanceType === 'solo') {
      toast.error('Solo events allow only one participant');
      return;
    }
    if (selectedEvent?.categoryDetails?.teamSize && students.length >= selectedEvent.categoryDetails.teamSize) {
      toast.error(`Maximum ${selectedEvent.categoryDetails.teamSize} participants allowed`);
      return;
    }
    setStudents([...students, { name: '', registerNumber: '', year: '', email: '', phone: '' }]);
  };

  const removeStudent = (index) => {
    if (students.length === 1) {
      toast.error('At least one student is required');
      return;
    }
    setStudents(students.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!selectedEvent) {
      toast.error('Please select an event');
      return false;
    }

    for (let i = 0; i < students.length; i++) {
      if (!students[i].name.trim()) {
        toast.error(`Please enter name for student ${i + 1}`);
        return false;
      }
      if (!students[i].registerNumber.trim()) {
        toast.error(`Please enter register number for student ${i + 1}`);
        return false;
      }
      if (!students[i].year) {
        toast.error(`Please select year for student ${i + 1}`);
        return false;
      }
    }

    // Check for cultural events specific validations
    if (selectedEvent.category === 'cultural') {
      if (!performanceDetails.performanceType) {
        toast.error('Please select performance type');
        return false;
      }
      if (performanceDetails.performanceType === 'group' && !performanceDetails.teamName.trim()) {
        toast.error('Please enter team name for group performance');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Check if already registered
      const registrationsRef = collection(db, 'registrations');
      const existingQuery = query(
        registrationsRef,
        where('eventId', '==', selectedEvent.id),
        where('departmentId', '==', departmentSession.departmentId)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        toast.error('Your department has already registered for this event');
        setSubmitting(false);
        return;
      }

      // Check max participants
      const eventRef = doc(db, 'events', selectedEvent.id);
      const eventDoc = await getDoc(eventRef);
      const eventData = eventDoc.data();

      if (eventData.maxParticipants && eventData.currentCount >= eventData.maxParticipants) {
        toast.error('This event has reached maximum participants');
        setSubmitting(false);
        return;
      }

      // Generate registration ID
      const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create registration document
      const registrationData = {
        registrationId,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        eventCategory: selectedEvent.category,
        departmentId: departmentSession.departmentId,
        departmentName: departmentSession.departmentName,
        departmentCode: departmentSession.departmentCode,
        students: students.map(s => ({
          name: s.name.trim(),
          registerNumber: s.registerNumber.trim().toUpperCase(),
          year: s.year,
          email: s.email.trim() || null,
          phone: s.phone.trim() || null,
        })),
        performanceDetails: selectedEvent.category === 'cultural' ? {
          songName: performanceDetails.songName.trim(),
          performanceType: performanceDetails.performanceType,
          teamName: performanceDetails.teamName.trim() || null,
          duration: performanceDetails.duration.trim() || null,
          specialRequirements: performanceDetails.specialRequirements.trim() || null,
        } : null,
        status: 'pending',
        eventToken: null,
        scores: {},
        judgeScores: {},
        totalScore: 0,
        rank: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(registrationsRef, registrationData);

      // Update event participant count
      await updateDoc(eventRef, {
        currentCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      toast.success('Registration submitted successfully!');
      navigate('/department/registrations');
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error('Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: '0.875rem',
    color: '#1E293B',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1E293B',
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
      <form onSubmit={handleSubmit}>
        {/* Event Selection */}
        <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 1rem 0' }}>
            Select Event
          </h3>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowEventDropdown(!showEventDropdown)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                color: selectedEvent ? '#1E293B' : '#64748B',
              }}
            >
              {selectedEvent ? selectedEvent.title : 'Select an event'}
              <ChevronDown style={{ width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
            </button>
            {showEventDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                maxHeight: '300px',
                overflow: 'auto',
                zIndex: 20,
              }}>
                {events.length === 0 ? (
                  <p style={{ padding: '1rem', color: '#64748B', textAlign: 'center', margin: 0 }}>
                    No events available
                  </p>
                ) : (
                  events.map(event => {
                    const eventDate = event.eventDate?.toDate ? event.eventDate.toDate() : new Date(event.eventDate);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventDropdown(false);
                          // Reset students if performance type changes
                          if (event.categoryDetails?.performanceType === 'solo') {
                            setStudents([students[0]]);
                          }
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.875rem 1rem',
                          backgroundColor: selectedEvent?.id === event.id ? '#F8FAFC' : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid #E2E8F0',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{
                          width: '3rem',
                          height: '3rem',
                          borderRadius: '0.5rem',
                          backgroundColor: '#1E3A5F',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '700', lineHeight: 1 }}>
                            {format(eventDate, 'dd')}
                          </span>
                          <span style={{ fontSize: '0.625rem', textTransform: 'uppercase' }}>
                            {format(eventDate, 'MMM')}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                            {event.title}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                            {event.category} | {event.startTime}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Selected Event Info */}
          {selectedEvent && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '0.5rem',
              border: '1px solid #E2E8F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Info style={{ width: '1rem', height: '1rem', color: '#3B82F6', marginTop: '0.125rem' }} />
                <div>
                  <p style={{ fontSize: '0.8125rem', color: '#1E293B', margin: 0 }}>
                    <strong>Category:</strong> {selectedEvent.category}
                    {selectedEvent.categoryDetails?.performanceType && (
                      <> | <strong>Type:</strong> {selectedEvent.categoryDetails.performanceType}</>
                    )}
                    {selectedEvent.categoryDetails?.teamSize && (
                      <> | <strong>Max Team Size:</strong> {selectedEvent.categoryDetails.teamSize}</>
                    )}
                  </p>
                  {selectedEvent.categoryDetails?.rules && (
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.5rem 0 0 0' }}>
                      {selectedEvent.categoryDetails.rules.substring(0, 150)}...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Student Details */}
        <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
              Student Details
            </h3>
            {selectedEvent?.categoryDetails?.performanceType !== 'solo' && (
              <button
                type="button"
                onClick={addStudent}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#1E3A5F',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                }}
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
                Add Student
              </button>
            )}
          </div>

          {students.map((student, index) => (
            <div
              key={index}
              style={{
                padding: '1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '0.5rem',
                marginBottom: index < students.length - 1 ? '1rem' : 0,
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B' }}>
                  Student {index + 1}
                </span>
                {students.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStudent(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                    Remove
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter student name"
                    value={student.name}
                    onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Register Number *</label>
                  <input
                    type="text"
                    placeholder="e.g., 21CSE001"
                    value={student.registerNumber}
                    onChange={(e) => handleStudentChange(index, 'registerNumber', e.target.value.toUpperCase())}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Year *</label>
                  <select
                    value={student.year}
                    onChange={(e) => handleStudentChange(index, 'year', e.target.value)}
                    style={inputStyle}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="student@email.com"
                    value={student.email}
                    onChange={(e) => handleStudentChange(index, 'email', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={student.phone}
                    onChange={(e) => handleStudentChange(index, 'phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Details (for Cultural Events) */}
        {selectedEvent?.category === 'cultural' && (
          <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 1rem 0' }}>
              Performance Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Performance Type *</label>
                <select
                  value={performanceDetails.performanceType}
                  onChange={(e) => {
                    setPerformanceDetails({ ...performanceDetails, performanceType: e.target.value });
                    if (e.target.value === 'solo') {
                      setStudents([students[0]]);
                    }
                  }}
                  style={inputStyle}
                  required
                >
                  <option value="solo">Solo</option>
                  <option value="duo">Duo</option>
                  <option value="group">Group</option>
                </select>
              </div>
              {performanceDetails.performanceType === 'group' && (
                <div>
                  <label style={labelStyle}>Team Name *</label>
                  <input
                    type="text"
                    placeholder="Enter team name"
                    value={performanceDetails.teamName}
                    onChange={(e) => setPerformanceDetails({ ...performanceDetails, teamName: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              )}
              <div>
                <label style={labelStyle}>Song/Performance Name</label>
                <input
                  type="text"
                  placeholder="Enter song or performance name"
                  value={performanceDetails.songName}
                  onChange={(e) => setPerformanceDetails({ ...performanceDetails, songName: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Duration (minutes)</label>
                <input
                  type="text"
                  placeholder="e.g., 5 mins"
                  value={performanceDetails.duration}
                  onChange={(e) => setPerformanceDetails({ ...performanceDetails, duration: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Special Requirements</label>
                <textarea
                  placeholder="Any special requirements (props, music system, etc.)"
                  value={performanceDetails.specialRequirements}
                  onChange={(e) => setPerformanceDetails({ ...performanceDetails, specialRequirements: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !selectedEvent}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
            backgroundColor: submitting || !selectedEvent ? '#94A3B8' : '#E91E63',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: submitting || !selectedEvent ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
          }}
        >
          {submitting ? (
            <>
              <div style={{
                width: '1.25rem',
                height: '1.25rem',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#FFFFFF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              Submitting...
            </>
          ) : (
            <>
              <UserPlus style={{ width: '1.25rem', height: '1.25rem' }} />
              Submit Registration
            </>
          )}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>
    </div>
  );
};

export default StudentRegistration;
