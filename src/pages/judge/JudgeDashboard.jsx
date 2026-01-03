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
  MapPin,
  LayoutDashboard,
  Award,
  ClipboardList,
  BarChart3,
  BookOpen,
  User,
  Bell,
  ChevronRight,
  Lock,
  MessageSquare,
  X,
  Menu,
  AlertCircle,
  Trophy,
  Target,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const JudgeDashboard = () => {
  const navigate = useNavigate();
  const [judgeSession, setJudgeSession] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState({});
  const [saving, setSaving] = useState({});
  const [submittedParticipants, setSubmittedParticipants] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scoring criteria (can be customized per event)
  const defaultCriteria = [
    { id: 'presentation', name: 'Presentation', maxScore: 25 },
    { id: 'content', name: 'Content/Knowledge', maxScore: 25 },
    { id: 'creativity', name: 'Creativity', maxScore: 25 },
    { id: 'overall', name: 'Overall Impact', maxScore: 25 },
  ];

  const [scoringCriteria, setScoringCriteria] = useState(defaultCriteria);

  useEffect(() => {
    const session = sessionStorage.getItem('judgeSession');
    if (!session) {
      navigate('/judge/login');
      return;
    }
    const parsedSession = JSON.parse(session);

    // Handle backward compatibility with old session format
    if (parsedSession.eventId && !parsedSession.assignedEvents) {
      const convertedSession = {
        judgeId: parsedSession.judgeId,
        judgeName: parsedSession.judgeName,
        judgeEmail: parsedSession.judgeEmail || '',
        assignedEvents: [{
          id: parsedSession.eventId,
          title: parsedSession.eventTitle,
        }],
      };
      setJudgeSession(convertedSession);
      setSelectedEventId(parsedSession.eventId);
    } else {
      setJudgeSession(parsedSession);
      if (parsedSession.assignedEvents?.length > 0) {
        setSelectedEventId(parsedSession.assignedEvents[0].id);
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedEventId && judgeSession) {
      fetchEventData();
    }
  }, [selectedEventId, judgeSession]);

  const fetchEventData = async () => {
    setLoading(true);
    try {
      // Fetch event details
      const eventDoc = await getDoc(doc(db, 'events', selectedEventId));
      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        setEvent(eventData);

        // Set scoring criteria from event if available
        if (eventData.categoryDetails?.scoringCriteria) {
          setScoringCriteria(eventData.categoryDetails.scoringCriteria);
        } else {
          setScoringCriteria(defaultCriteria);
        }
      }

      // Fetch participants for this event
      const regsRef = collection(db, 'registrations');
      const q = query(regsRef, where('eventId', '==', selectedEventId));
      const snapshot = await getDocs(q);
      const regsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParticipants(regsList);

      // Initialize scores and remarks
      const initialScores = {};
      const initialRemarks = {};
      const initialSubmitted = {};

      regsList.forEach(reg => {
        const existingScoreData = reg.judgeScores?.[judgeSession.judgeId];
        if (existingScoreData) {
          initialScores[reg.id] = existingScoreData.criteriaScores || {};
          initialRemarks[reg.id] = existingScoreData.remarks || '';
          initialSubmitted[reg.id] = existingScoreData.submitted || false;
        } else {
          const oldScore = reg.scores?.[judgeSession.judgeId];
          if (oldScore !== undefined) {
            initialScores[reg.id] = { overall: oldScore };
            initialSubmitted[reg.id] = true;
          } else {
            initialScores[reg.id] = {};
          }
          initialRemarks[reg.id] = '';
        }
      });

      setScores(initialScores);
      setRemarks(initialRemarks);
      setSubmittedParticipants(initialSubmitted);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('judgeSession');
    navigate('/judge/login');
    toast.success('Logged out successfully');
  };

  const handleCriteriaScoreChange = (participantId, criteriaId, value) => {
    const criteria = scoringCriteria.find(c => c.id === criteriaId);
    const maxScore = criteria?.maxScore || 100;
    const numValue = Math.min(maxScore, Math.max(0, parseInt(value) || 0));

    setScores(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [criteriaId]: numValue,
      },
    }));
  };

  const handleRemarksChange = (participantId, value) => {
    setRemarks(prev => ({ ...prev, [participantId]: value }));
  };

  const calculateTotalScore = (participantId) => {
    const participantScores = scores[participantId] || {};
    return Object.values(participantScores).reduce((sum, score) => sum + (parseInt(score) || 0), 0);
  };

  const getMaxTotalScore = () => {
    return scoringCriteria.reduce((sum, c) => sum + c.maxScore, 0);
  };

  const saveScore = async (participantId, submitFinal = false) => {
    const participantScores = scores[participantId] || {};
    const totalScore = calculateTotalScore(participantId);

    if (Object.keys(participantScores).length === 0) {
      toast.error('Please enter at least one score');
      return;
    }

    if (submitFinal && submittedParticipants[participantId]) {
      toast.error('Score already submitted and locked');
      return;
    }

    setSaving(prev => ({ ...prev, [participantId]: true }));
    try {
      const participant = participants.find(p => p.id === participantId);

      const updatedJudgeScores = {
        ...(participant.judgeScores || {}),
        [judgeSession.judgeId]: {
          criteriaScores: participantScores,
          totalScore: totalScore,
          remarks: remarks[participantId] || '',
          submitted: submitFinal,
          submittedAt: submitFinal ? new Date().toISOString() : null,
          judgeName: judgeSession.judgeName,
        },
      };

      const updatedScores = {
        ...(participant.scores || {}),
        [judgeSession.judgeId]: totalScore,
      };

      await updateDoc(doc(db, 'registrations', participantId), {
        judgeScores: updatedJudgeScores,
        scores: updatedScores,
      });

      setParticipants(prev =>
        prev.map(p =>
          p.id === participantId
            ? { ...p, judgeScores: updatedJudgeScores, scores: updatedScores }
            : p
        )
      );

      if (submitFinal) {
        setSubmittedParticipants(prev => ({ ...prev, [participantId]: true }));
        toast.success('Score submitted and locked!');
      } else {
        toast.success('Score saved as draft!');
      }
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

  const scoredCount = participants.filter(p =>
    p.judgeScores?.[judgeSession?.judgeId]?.submitted ||
    p.scores?.[judgeSession?.judgeId] !== undefined
  ).length;

  const formatEventDate = (date) => {
    if (!date) return 'Date not set';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return format(d, 'MMM dd, yyyy');
    } catch {
      return 'Date not set';
    }
  };

  const getResultsPreview = () => {
    return participants
      .map(p => {
        const judgeScoreData = p.judgeScores?.[judgeSession?.judgeId];
        const totalScore = judgeScoreData?.totalScore || p.scores?.[judgeSession?.judgeId] || 0;
        return { ...p, myScore: totalScore };
      })
      .filter(p => p.myScore > 0)
      .sort((a, b) => b.myScore - a.myScore);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Assigned Events', icon: Calendar },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'scoring', label: 'Scoring Panel', icon: ClipboardList },
    { id: 'results', label: 'Results Preview', icon: BarChart3 },
    { id: 'rules', label: 'Rules & Criteria', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (!judgeSession) {
    return null;
  }

  // Render Dashboard
  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #E91E63 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          right: '20%',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.5rem' }}>
            Welcome back, {judgeSession.judgeName}!
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>
            Ready to evaluate participants? Let's make fair judgments!
          </p>
          {event && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              marginTop: '1.5rem',
              fontSize: '0.9375rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
              }}>
                <Trophy style={{ width: '1.125rem', height: '1.125rem' }} />
                {event.title}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
              }}>
                <Calendar style={{ width: '1.125rem', height: '1.125rem' }} />
                {formatEventDate(event.eventDate)}
              </div>
              {event.category && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  textTransform: 'capitalize',
                }}>
                  <Target style={{ width: '1.125rem', height: '1.125rem' }} />
                  {event.category}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(139, 92, 246, 0.2)',
            borderRadius: '50%',
          }} />
          <Users style={{ width: '2rem', height: '2rem', color: '#8B5CF6', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {participants.length}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0.25rem 0 0' }}>Total Participants</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '50%',
          }} />
          <CheckCircle style={{ width: '2rem', height: '2rem', color: '#059669', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {scoredCount}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#064E3B', margin: '0.25rem 0 0' }}>Scored</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(245, 158, 11, 0.2)',
            borderRadius: '50%',
          }} />
          <Clock style={{ width: '2rem', height: '2rem', color: '#D97706', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {participants.length - scoredCount}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#78350F', margin: '0.25rem 0 0' }}>Pending</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(233, 30, 99, 0.2)',
            borderRadius: '50%',
          }} />
          <Award style={{ width: '2rem', height: '2rem', color: '#E91E63', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {judgeSession.assignedEvents?.length || 1}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#831843', margin: '0.25rem 0 0' }}>Events Assigned</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveSection('scoring')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(233, 30, 99, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.3)';
            }}
          >
            <ClipboardList style={{ width: '1.125rem', height: '1.125rem' }} />
            Start Scoring
          </button>
          <button
            onClick={() => setActiveSection('results')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              backgroundColor: '#FFFFFF',
              color: '#64748B',
              border: '2px solid #E2E8F0',
              borderRadius: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#E91E63';
              e.currentTarget.style.color = '#E91E63';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            <BarChart3 style={{ width: '1.125rem', height: '1.125rem' }} />
            View Results
          </button>
          <button
            onClick={() => setActiveSection('rules')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              backgroundColor: '#FFFFFF',
              color: '#64748B',
              border: '2px solid #E2E8F0',
              borderRadius: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#E91E63';
              e.currentTarget.style.color = '#E91E63';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            <BookOpen style={{ width: '1.125rem', height: '1.125rem' }} />
            View Criteria
          </button>
        </div>
      </div>

      {/* Recent Participants */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
            Recent Participants
          </h3>
          <button
            onClick={() => setActiveSection('participants')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              color: '#E91E63',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            View All <ChevronRight style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            Loading participants...
          </div>
        ) : participants.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            No participants registered yet
          </div>
        ) : (
          <div>
            {participants.slice(0, 5).map((participant, index) => {
              const isScored = participant.scores?.[judgeSession?.judgeId] !== undefined;
              return (
                <div
                  key={participant.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    borderBottom: index < Math.min(participants.length, 5) - 1 ? '1px solid #F1F5F9' : 'none',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      background: isScored
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: '600',
                      fontSize: '1rem',
                    }}>
                      {isScored ? <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} /> : participant.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                        {participant.fullName}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.125rem 0 0' }}>
                        {participant.registrationId}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    padding: '0.375rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    backgroundColor: isScored ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: isScored ? '#059669' : '#D97706',
                  }}>
                    {isScored ? 'Scored' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Render Events
  const renderEvents = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem' }}>
          Assigned Events
        </h2>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
          Select an event to start scoring participants
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1.25rem' }}>
        {judgeSession.assignedEvents?.map((evt) => {
          const isSelected = selectedEventId === evt.id;
          const displayData = (event && event.id === evt.id) ? event : evt;

          return (
            <div
              key={evt.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '1rem',
                padding: '1.5rem',
                cursor: 'pointer',
                border: isSelected ? '2px solid #E91E63' : '2px solid transparent',
                boxShadow: isSelected ? '0 8px 30px rgba(233, 30, 99, 0.15)' : '0 4px 20px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => setSelectedEventId(evt.id)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
                }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.75rem' }}>
                    {displayData.title}
                  </h3>
                  {displayData.category && (
                    <span style={{
                      display: 'inline-block',
                      padding: '0.375rem 0.875rem',
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                      color: '#8B5CF6',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      textTransform: 'capitalize',
                    }}>
                      {displayData.category}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#FFFFFF' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: '#64748B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar style={{ width: '1rem', height: '1rem', color: '#E91E63' }} />
                  {formatEventDate(displayData.eventDate)}
                </div>
                {displayData.venue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin style={{ width: '1rem', height: '1rem', color: '#E91E63' }} />
                    {displayData.venue}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Participants
  const renderParticipants = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem' }}>
            Participants
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
            {participants.length} participants registered
          </p>
        </div>
        <div style={{ position: 'relative', width: '100%', maxWidth: '20rem' }}>
          <Search style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1.125rem',
            height: '1.125rem',
            color: '#94A3B8',
          }} />
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              backgroundColor: '#FFFFFF',
              border: '2px solid #E2E8F0',
              borderRadius: '0.75rem',
              fontSize: '0.9375rem',
              color: '#1E293B',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#E91E63'}
            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>
      </div>

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            Loading participants...
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            No participants found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Participant
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Registration ID
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    My Score
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.8125rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => {
                  const myScore = participant.scores?.[judgeSession?.judgeId];
                  const isScored = myScore !== undefined;
                  const isSubmitted = submittedParticipants[participant.id];

                  return (
                    <tr
                      key={participant.id}
                      style={{ borderTop: '1px solid #F1F5F9', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <div style={{
                            width: '2.75rem',
                            height: '2.75rem',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontWeight: '600',
                            fontSize: '1rem',
                          }}>
                            {participant.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                              {participant.fullName}
                            </p>
                            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                              {participant.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9375rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {participant.registrationId}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: isScored ? '#1E293B' : '#94A3B8',
                        }}>
                          {isScored ? `${myScore}` : '-'}
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748B' }}>
                            /{getMaxTotalScore()}
                          </span>
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.375rem 0.875rem',
                          borderRadius: '9999px',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          backgroundColor: isSubmitted
                            ? 'rgba(16, 185, 129, 0.1)'
                            : isScored
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(148, 163, 184, 0.1)',
                          color: isSubmitted ? '#059669' : isScored ? '#D97706' : '#64748B',
                        }}>
                          {isSubmitted && <Lock style={{ width: '0.75rem', height: '0.75rem' }} />}
                          {isSubmitted ? 'Locked' : isScored ? 'Draft' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => setActiveSection('scoring')}
                          disabled={isSubmitted}
                          style={{
                            padding: '0.5rem 1.25rem',
                            background: isSubmitted ? '#F1F5F9' : 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
                            color: isSubmitted ? '#94A3B8' : '#FFFFFF',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: isSubmitted ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => !isSubmitted && (e.currentTarget.style.transform = 'scale(1.05)')}
                          onMouseLeave={(e) => !isSubmitted && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          {isSubmitted ? 'Locked' : isScored ? 'Edit' : 'Score'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Render Scoring Panel
  const renderScoringPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem' }}>
            Scoring Panel
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
            Evaluate each participant based on the criteria
          </p>
        </div>
        <div style={{ position: 'relative', width: '100%', maxWidth: '20rem' }}>
          <Search style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1.125rem',
            height: '1.125rem',
            color: '#94A3B8',
          }} />
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              backgroundColor: '#FFFFFF',
              border: '2px solid #E2E8F0',
              borderRadius: '0.75rem',
              fontSize: '0.9375rem',
              color: '#1E293B',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Scoring Criteria Info */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Target style={{ width: '1.25rem', height: '1.25rem', color: '#8B5CF6' }} />
          <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>
            Scoring Criteria (Total: {getMaxTotalScore()} points)
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {scoringCriteria.map(criteria => (
            <span
              key={criteria.id}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#64748B',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              {criteria.name}: <strong style={{ color: '#8B5CF6' }}>{criteria.maxScore}</strong> pts
            </span>
          ))}
        </div>
      </div>

      {/* Participants Scoring */}
      {loading ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center',
          color: '#64748B',
        }}>
          Loading participants...
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center',
          color: '#64748B',
        }}>
          No participants found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredParticipants.map((participant) => {
            const isSubmitted = submittedParticipants[participant.id];
            const totalScore = calculateTotalScore(participant.id);
            const participantScores = scores[participant.id] || {};
            const percentage = Math.round((totalScore / getMaxTotalScore()) * 100);

            return (
              <div
                key={participant.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  border: isSubmitted ? '2px solid #10B981' : '2px solid transparent',
                  opacity: isSubmitted ? 0.85 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #F1F5F9',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: '50%',
                      background: isSubmitted
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: '700',
                      fontSize: '1.125rem',
                    }}>
                      {isSubmitted ? <Lock style={{ width: '1.5rem', height: '1.5rem' }} /> : participant.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                        {participant.fullName}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                        {participant.registrationId} • {participant.email}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      background: `linear-gradient(135deg, ${percentage >= 70 ? '#10B981' : percentage >= 40 ? '#F59E0B' : '#EF4444'} 0%, ${percentage >= 70 ? '#059669' : percentage >= 40 ? '#D97706' : '#DC2626'} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {totalScore}
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        background: 'none',
                        WebkitTextFillColor: '#64748B',
                      }}>/{getMaxTotalScore()}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Total Score</p>
                  </div>
                </div>

                {/* Criteria Scores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                  {scoringCriteria.map(criteria => (
                    <div key={criteria.id}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: '#64748B',
                        marginBottom: '0.5rem',
                      }}>
                        {criteria.name}
                        <span style={{ color: '#94A3B8', fontWeight: '400' }}> (0-{criteria.maxScore})</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={criteria.maxScore}
                        placeholder="0"
                        value={participantScores[criteria.id] || ''}
                        onChange={(e) => handleCriteriaScoreChange(participant.id, criteria.id, e.target.value)}
                        disabled={isSubmitted}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: isSubmitted ? '#F1F5F9' : '#F8FAFC',
                          border: '2px solid #E2E8F0',
                          borderRadius: '0.625rem',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#1E293B',
                          textAlign: 'center',
                          outline: 'none',
                          cursor: isSubmitted ? 'not-allowed' : 'text',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => !isSubmitted && (e.target.style.borderColor = '#E91E63')}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                      />
                    </div>
                  ))}
                </div>

                {/* Remarks */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    color: '#64748B',
                    marginBottom: '0.5rem',
                  }}>
                    <MessageSquare style={{ width: '0.875rem', height: '0.875rem' }} />
                    Remarks (Optional)
                  </label>
                  <textarea
                    placeholder="Add any remarks or feedback for this participant..."
                    value={remarks[participant.id] || ''}
                    onChange={(e) => handleRemarksChange(participant.id, e.target.value)}
                    disabled={isSubmitted}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      backgroundColor: isSubmitted ? '#F1F5F9' : '#F8FAFC',
                      border: '2px solid #E2E8F0',
                      borderRadius: '0.625rem',
                      fontSize: '0.9375rem',
                      color: '#1E293B',
                      minHeight: '80px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      outline: 'none',
                      cursor: isSubmitted ? 'not-allowed' : 'text',
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  {isSubmitted ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      color: '#059669',
                      borderRadius: '0.625rem',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                    }}>
                      <Lock style={{ width: '1rem', height: '1rem' }} />
                      Score Submitted & Locked
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => saveScore(participant.id, false)}
                        disabled={saving[participant.id]}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#FFFFFF',
                          color: '#64748B',
                          border: '2px solid #E2E8F0',
                          borderRadius: '0.625rem',
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#64748B';
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                      >
                        <Save style={{ width: '1rem', height: '1rem' }} />
                        {saving[participant.id] ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={() => saveScore(participant.id, true)}
                        disabled={saving[participant.id]}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '0.625rem',
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(233, 30, 99, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.3)';
                        }}
                      >
                        <Lock style={{ width: '1rem', height: '1rem' }} />
                        {saving[participant.id] ? 'Submitting...' : 'Submit & Lock'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render Results Preview
  const renderResultsPreview = () => {
    const results = getResultsPreview();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              Results Preview
            </h2>
            <span style={{
              padding: '0.375rem 0.75rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              color: '#D97706',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}>
              Your Scores Only
            </span>
          </div>
          <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
            Rankings based on your submitted scores
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
          borderRadius: '1rem',
          padding: '1rem 1.25rem',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#3B82F6', flexShrink: 0 }} />
          <span style={{ fontSize: '0.9375rem', color: '#1E293B' }}>
            This preview shows rankings based on <strong>your scores only</strong>. Final results may vary based on all judges' scores.
          </span>
        </div>

        {results.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '1rem',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            <Trophy style={{ width: '4rem', height: '4rem', color: '#E2E8F0', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#64748B', margin: 0 }}>
              No scores submitted yet
            </p>
            <p style={{ fontSize: '0.9375rem', color: '#94A3B8', marginTop: '0.5rem' }}>
              Start scoring participants to see results here
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            {results.map((participant, index) => (
              <div
                key={participant.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  borderBottom: index < results.length - 1 ? '1px solid #F1F5F9' : 'none',
                  background: index === 0
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)'
                    : index === 1
                    ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(158, 158, 158, 0.05) 100%)'
                    : index === 2
                    ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(184, 115, 51, 0.05) 100%)'
                    : 'transparent',
                }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  background: index === 0
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)'
                    : index === 1
                    ? 'linear-gradient(135deg, #C0C0C0 0%, #9E9E9E 100%)'
                    : index === 2
                    ? 'linear-gradient(135deg, #CD7F32 0%, #B8733D 100%)'
                    : '#F1F5F9',
                  color: index < 3 ? '#FFFFFF' : '#64748B',
                  boxShadow: index < 3 ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                }}>
                  {index + 1}
                </div>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  fontSize: '1rem',
                  marginRight: '1rem',
                }}>
                  {participant.fullName?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                    {participant.fullName}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.125rem 0 0' }}>
                    {participant.registrationId}
                  </p>
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1E293B',
                }}>
                  {participant.myScore}
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748B' }}>
                    /{getMaxTotalScore()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Rules
  const renderRules = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem' }}>
          Rules & Scoring Criteria
        </h2>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
          Guidelines for fair and consistent evaluation
        </p>
      </div>

      {/* Scoring Criteria */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', marginBottom: '1.25rem' }}>
          Scoring Criteria
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {scoringCriteria.map((criteria, index) => (
            <div
              key={criteria.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                borderRadius: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '1rem',
                }}>
                  {index + 1}
                </div>
                <span style={{ fontSize: '1rem', fontWeight: '500', color: '#1E293B' }}>
                  {criteria.name}
                </span>
              </div>
              <span style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
                color: '#FFFFFF',
                borderRadius: '9999px',
                fontSize: '0.9375rem',
                fontWeight: '700',
              }}>
                {criteria.maxScore} pts
              </span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: '1.25rem',
          padding: '1.25rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
          borderRadius: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>
            Total Maximum Score
          </span>
          <span style={{
            padding: '0.625rem 1.25rem',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            borderRadius: '0.625rem',
            fontSize: '1.125rem',
            fontWeight: '700',
          }}>
            {getMaxTotalScore()} Points
          </span>
        </div>
      </div>

      {/* Guidelines */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>
          Judging Guidelines
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#64748B', lineHeight: '2' }}>
          <li>Evaluate each participant fairly and without bias</li>
          <li>Score each criteria independently based on the participant's performance</li>
          <li>Use the full range of scores (0 to max) to differentiate performances</li>
          <li>Add remarks to provide constructive feedback</li>
          <li>Once submitted, scores cannot be changed - review carefully before final submission</li>
          <li>Contact the event organizer for any issues or clarifications</li>
        </ul>
      </div>

      {/* Important Notes */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(245, 158, 11, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#F59E0B', flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.75rem' }}>
              Important Notes
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#64748B', lineHeight: '1.875' }}>
              <li>You can only see events and participants assigned to you</li>
              <li><strong>Save Draft</strong> - Save progress without locking the score</li>
              <li><strong>Submit & Lock</strong> - Finalize your score (cannot be changed after)</li>
              <li>Results preview shows ranking based on your scores only</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Profile
  const renderProfile = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem' }}>
          Judge Profile
        </h2>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
          Your account information
        </p>
      </div>

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: '6rem',
            height: '6rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '2.5rem',
            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.3)',
          }}>
            {judgeSession.judgeName?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem' }}>
              {judgeSession.judgeName}
            </h3>
            <p style={{
              display: 'inline-block',
              padding: '0.375rem 1rem',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
              color: '#8B5CF6',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}>
              Event Judge
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Judge ID', value: judgeSession.judgeId },
            ...(judgeSession.judgeEmail ? [{ label: 'Email', value: judgeSession.judgeEmail }] : []),
            { label: 'Assigned Events', value: judgeSession.assignedEvents?.length || 1 },
            { label: 'Current Event', value: event?.title || 'Loading...' },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '0.75rem',
              }}
            >
              <span style={{ fontSize: '0.9375rem', color: '#64748B' }}>{item.label}</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            marginTop: '2rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
            color: '#EF4444',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)';
          }}
        >
          <LogOut style={{ width: '1.125rem', height: '1.125rem' }} />
          Logout
        </button>
      </div>
    </div>
  );

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'events': return renderEvents();
      case 'participants': return renderParticipants();
      case 'scoring': return renderScoringPanel();
      case 'results': return renderResultsPreview();
      case 'rules': return renderRules();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30,
          }}
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '17rem',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #F1F5F9',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
        }}
        className="lg:translate-x-0"
      >
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          padding: '1.5rem',
          borderBottom: '1px solid #F1F5F9',
        }}>
          <div style={{
            width: '2.75rem',
            height: '2.75rem',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            borderRadius: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
          }}>
            <UserCheck style={{ width: '1.5rem', height: '1.5rem', color: '#FFFFFF' }} />
          </div>
          <div>
            <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1E293B' }}>Judge Panel</span>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
              {judgeSession.judgeName}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              marginLeft: 'auto',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
            }}
            className="lg:hidden"
          >
            <X style={{ width: '1.5rem', height: '1.5rem' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.25rem 1rem', overflowY: 'auto' }}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(233, 30, 99, 0.08)' : 'transparent',
                  color: isActive ? '#E91E63' : '#64748B',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: '0.375rem',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.color = '#1E293B';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid #F1F5F9' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.875rem 1rem',
              width: '100%',
              backgroundColor: 'transparent',
              color: '#EF4444',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut style={{ width: '1.25rem', height: '1.25rem' }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ marginLeft: '0' }} className="lg:ml-68">
        {/* Top Header */}
        <header style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '1rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                }}
                className="lg:hidden"
              >
                <Menu style={{ width: '1.5rem', height: '1.5rem' }} />
              </button>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                  {event?.title || 'Judge Dashboard'}
                </h1>
                {event && (
                  <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0.125rem 0 0' }}>
                    {formatEventDate(event.eventDate)} {event.category && `• ${event.category}`}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Notifications */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    padding: '0.625rem',
                    backgroundColor: showNotifications ? '#F8FAFC' : 'transparent',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    color: '#64748B',
                    position: 'relative',
                  }}
                >
                  <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
                  {participants.length - scoredCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0.375rem',
                      right: '0.375rem',
                      width: '0.625rem',
                      height: '0.625rem',
                      backgroundColor: '#EF4444',
                      borderRadius: '50%',
                      border: '2px solid #FFFFFF',
                    }} />
                  )}
                </button>
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '0.5rem',
                    width: '20rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    border: '1px solid #E2E8F0',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                        Notifications
                      </h4>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      {participants.length - scoredCount > 0 ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.875rem',
                          padding: '1rem',
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
                          borderRadius: '0.75rem',
                        }}>
                          <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#F59E0B', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                              Pending Scores
                            </p>
                            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                              {participants.length - scoredCount} participants awaiting your score
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <CheckCircle style={{ width: '2.5rem', height: '2.5rem', color: '#10B981', margin: '0 auto 0.75rem' }} />
                          <p style={{ fontSize: '0.9375rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                            All caught up!
                          </p>
                          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                            No pending scores
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1rem 0.5rem 0.5rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveSection('profile')}
              >
                <div style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                }}>
                  {judgeSession.judgeName?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B' }}>
                  {judgeSession.judgeName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '1.5rem' }}>
          {renderContent()}
        </main>
      </div>

      {/* CSS for lg breakpoint */}
      <style>{`
        @media (min-width: 1024px) {
          .lg\\:translate-x-0 {
            transform: translateX(0) !important;
          }
          .lg\\:ml-68 {
            margin-left: 17rem !important;
          }
          .lg\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JudgeDashboard;
