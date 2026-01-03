import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  UserCheck,
  LogOut,
  Users,
  Star,
  CheckCircle,
  Search,
  Save,
  Calendar,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const JudgeDashboard = () => {
  const navigate = useNavigate();
  const [judgeSession, setJudgeSession] = useState(null);
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const session = sessionStorage.getItem('judgeSession');
    if (!session) {
      navigate('/login');
      return;
    }
    setJudgeSession(JSON.parse(session));
  }, [navigate]);

  useEffect(() => {
    if (judgeSession) {
      fetchEventData();
    }
  }, [judgeSession]);

  const fetchEventData = async () => {
    try {
      // Fetch event
      const eventDoc = await getDoc(doc(db, 'events', judgeSession.eventId));
      if (eventDoc.exists()) {
        setEvent({ id: eventDoc.id, ...eventDoc.data() });
      }

      // Fetch participants
      const regsRef = collection(db, 'registrations');
      const q = query(regsRef, where('eventId', '==', judgeSession.eventId));
      const snapshot = await getDocs(q);
      const regsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParticipants(regsList);

      // Initialize scores
      const initialScores = {};
      regsList.forEach(reg => {
        const existingScore = reg.scores?.[judgeSession.judgeId];
        initialScores[reg.id] = existingScore || '';
      });
      setScores(initialScores);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('judgeSession');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleScoreChange = (participantId, value) => {
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    setScores(prev => ({ ...prev, [participantId]: numValue }));
  };

  const saveScore = async (participantId) => {
    const score = scores[participantId];
    if (score === '' || score === undefined) {
      toast.error('Please enter a score');
      return;
    }

    setSaving(prev => ({ ...prev, [participantId]: true }));
    try {
      const participant = participants.find(p => p.id === participantId);
      const updatedScores = {
        ...(participant.scores || {}),
        [judgeSession.judgeId]: parseInt(score),
      };

      await updateDoc(doc(db, 'registrations', participantId), {
        scores: updatedScores,
      });

      // Update local state
      setParticipants(prev =>
        prev.map(p =>
          p.id === participantId ? { ...p, scores: updatedScores } : p
        )
      );

      toast.success('Score saved!');
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Failed to save score');
    } finally {
      setSaving(prev => ({ ...prev, [participantId]: false }));
    }
  };

  const filteredParticipants = participants.filter(p =>
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.registrationId?.includes(searchTerm)
  );

  const scoredCount = participants.filter(p => p.scores?.[judgeSession?.judgeId]).length;

  const formatEventDate = (date) => {
    if (!date) return '-';
    const d = date.toDate ? date.toDate() : new Date(date);
    return format(d, 'MMMM dd, yyyy');
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

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 1rem',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#1E293B',
    outline: 'none',
  };

  if (!judgeSession) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: 'rgba(233, 30, 99, 0.1)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UserCheck style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                Judge Dashboard
              </h1>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                Welcome, {judgeSession.judgeName}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#FFFFFF',
              color: '#EF4444',
              border: '1px solid #FEE2E2',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <LogOut style={{ width: '1rem', height: '1rem' }} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Event Info */}
          {event && (
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #1E3A5F 0%, #E91E63 100%)', color: '#FFFFFF' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 0.75rem' }}>{event.title}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar style={{ width: '1rem', height: '1rem' }} />
                  {formatEventDate(event.eventDate)}
                </div>
                {event.venue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin style={{ width: '1rem', height: '1rem' }} />
                    {event.venue}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '1.25rem' }}>
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
                  {participants.length}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Total Participants</p>
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
                  {scoredCount}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Scored</p>
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={{
                width: '2.75rem',
                height: '2.75rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Star style={{ width: '1.25rem', height: '1.25rem', color: '#F59E0B' }} />
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                  {participants.length - scoredCount}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Pending</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={cardStyle}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '24rem' }}>
              <Search style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1rem',
                height: '1rem',
                color: '#94A3B8',
              }} />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Participants List */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                Participants to Score
              </h2>
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                Loading participants...
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                No participants found
              </div>
            ) : (
              <div>
                {filteredParticipants.map((participant, index) => {
                  const hasScore = participant.scores?.[judgeSession.judgeId] !== undefined;

                  return (
                    <div
                      key={participant.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        borderBottom: index < filteredParticipants.length - 1 ? '1px solid #F1F5F9' : 'none',
                        backgroundColor: hasScore ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1 }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          background: hasScore
                            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                        }}>
                          {hasScore ? (
                            <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                          ) : (
                            participant.fullName?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.9375rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                            {participant.fullName}
                          </p>
                          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                            {participant.registrationId}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={scores[participant.id] || ''}
                            onChange={(e) => handleScoreChange(participant.id, e.target.value)}
                            style={{
                              width: '80px',
                              padding: '0.5rem 0.75rem',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              color: '#1E293B',
                              textAlign: 'center',
                              outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: '0.875rem', color: '#64748B' }}>/100</span>
                        </div>
                        <button
                          onClick={() => saveScore(participant.id)}
                          disabled={saving[participant.id]}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 0.875rem',
                            backgroundColor: '#E91E63',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.8125rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            opacity: saving[participant.id] ? 0.7 : 1,
                          }}
                        >
                          <Save style={{ width: '0.875rem', height: '0.875rem' }} />
                          {saving[participant.id] ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JudgeDashboard;
