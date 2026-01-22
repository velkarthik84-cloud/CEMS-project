import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  BarChart3,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  ChevronDown,
  RefreshCw,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';

const LiveScores = () => {
  const { departmentSession } = useOutletContext();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch events with published status
  useEffect(() => {
    const eventsRef = collection(db, 'events');
    const eventsQuery = query(eventsRef, where('status', 'in', ['published', 'completed']));

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);

      // Pre-select event from URL params or first event
      const eventId = searchParams.get('eventId');
      if (eventId) {
        const event = eventsData.find(e => e.id === eventId);
        if (event) setSelectedEvent(event);
      } else if (eventsData.length > 0 && !selectedEvent) {
        setSelectedEvent(eventsData[0]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchParams]);

  // Fetch registrations and scores for selected event
  useEffect(() => {
    if (!selectedEvent) return;

    const registrationsRef = collection(db, 'registrations');
    const regQuery = query(
      registrationsRef,
      where('eventId', '==', selectedEvent.id),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(regQuery, (snapshot) => {
      const regsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate total scores and rankings
      const scoredRegs = regsData.map(reg => {
        let totalScore = 0;
        let judgeCount = 0;

        if (reg.judgeScores) {
          Object.values(reg.judgeScores).forEach(judgeScore => {
            if (judgeScore.submitted && judgeScore.totalScore !== undefined) {
              totalScore += judgeScore.totalScore;
              judgeCount++;
            }
          });
        }

        const avgScore = judgeCount > 0 ? totalScore / judgeCount : 0;

        return {
          ...reg,
          totalScore,
          avgScore,
          judgeCount,
        };
      });

      // Sort by average score (descending)
      scoredRegs.sort((a, b) => b.avgScore - a.avgScore);

      // Assign ranks
      let currentRank = 1;
      scoredRegs.forEach((reg, index) => {
        if (index > 0 && scoredRegs[index - 1].avgScore === reg.avgScore) {
          reg.rank = scoredRegs[index - 1].rank;
        } else {
          reg.rank = currentRank;
        }
        currentRank++;
      });

      setLeaderboard(scoredRegs);
      setMyRegistrations(scoredRegs.filter(r => r.departmentId === departmentSession?.departmentId));
      setLastUpdated(new Date());
    });

    return () => unsubscribe();
  }, [selectedEvent, departmentSession]);

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#000', icon: Trophy };
      case 2:
        return { bg: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)', color: '#000', icon: Medal };
      case 3:
        return { bg: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)', color: '#FFF', icon: Award };
      default:
        return { bg: '#F8FAFC', color: '#64748B', icon: null };
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
      {/* Event Selection */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <label style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem', display: 'block' }}>
              Select Event
            </label>
            <button
              type="button"
              onClick={() => setShowEventDropdown(!showEventDropdown)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: selectedEvent ? '#1E293B' : '#64748B',
              }}
            >
              {selectedEvent ? selectedEvent.title : 'Select an event'}
              <ChevronDown style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
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
                maxHeight: '250px',
                overflow: 'auto',
                zIndex: 20,
              }}>
                {events.map(event => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: selectedEvent?.id === event.id ? '#F8FAFC' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#1E293B',
                    }}
                  >
                    {event.title}
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '0.5rem' }}>
                      ({event.category})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {lastUpdated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748B' }}>
              <RefreshCw style={{ width: '0.875rem', height: '0.875rem' }} />
              Last updated: {format(lastUpdated, 'HH:mm:ss')}
            </div>
          )}
        </div>
      </div>

      {/* My Department's Registrations */}
      {myRegistrations.length > 0 && (
        <div style={{
          ...cardStyle,
          marginBottom: '1.5rem',
          border: '2px solid #E91E63',
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, #FFFFFF 100%)',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 1rem 0' }}>
            Your Department's Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myRegistrations.map((reg) => {
              const rankStyle = getRankStyle(reg.rank);
              return (
                <div
                  key={reg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.75rem',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      background: rankStyle.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: rankStyle.color,
                      fontWeight: '700',
                      fontSize: '1.125rem',
                    }}>
                      {reg.rank <= 3 && rankStyle.icon ? (
                        <rankStyle.icon style={{ width: '1.5rem', height: '1.5rem' }} />
                      ) : (
                        `#${reg.rank}`
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                        {reg.students?.map(s => s.name).join(', ') || 'Team'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                        {reg.performanceDetails?.teamName || reg.performanceDetails?.performanceType || 'Participant'}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#E91E63', margin: 0 }}>
                      {reg.avgScore.toFixed(1)}
                    </p>
                    <p style={{ fontSize: '0.6875rem', color: '#64748B', margin: 0 }}>
                      Avg Score ({reg.judgeCount} judge{reg.judgeCount !== 1 ? 's' : ''})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
            Live Leaderboard
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '9999px',
          }}>
            <div style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '500' }}>Live</span>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <BarChart3 style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1rem', color: '#64748B', margin: 0 }}>
              No scores available yet
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0.5rem 0 0 0' }}>
              Scores will appear here once judges start scoring
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Rank
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Participant
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Department
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Judges
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Avg Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((reg, index) => {
                  const rankStyle = getRankStyle(reg.rank);
                  const isMyDept = reg.departmentId === departmentSession?.departmentId;
                  return (
                    <tr
                      key={reg.id}
                      style={{
                        borderBottom: '1px solid #E2E8F0',
                        backgroundColor: isMyDept ? 'rgba(233, 30, 99, 0.05)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          background: rankStyle.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: rankStyle.color,
                          fontWeight: '600',
                          fontSize: '0.875rem',
                        }}>
                          {reg.rank <= 3 && rankStyle.icon ? (
                            <rankStyle.icon style={{ width: '1.25rem', height: '1.25rem' }} />
                          ) : (
                            reg.rank
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <p style={{
                            fontSize: '0.875rem',
                            fontWeight: isMyDept ? '600' : '500',
                            color: '#1E293B',
                            margin: 0,
                          }}>
                            {reg.students?.map(s => s.name).join(', ') || 'Team'}
                            {isMyDept && (
                              <Star style={{ width: '0.875rem', height: '0.875rem', color: '#E91E63', marginLeft: '0.5rem', display: 'inline' }} />
                            )}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                            {reg.performanceDetails?.songName || reg.performanceDetails?.teamName || ''}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: isMyDept ? '#E91E63' : '#F8FAFC',
                          color: isMyDept ? '#FFFFFF' : '#1E293B',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                        }}>
                          {reg.departmentCode || reg.departmentName}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.625rem',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '0.375rem',
                          fontSize: '0.8125rem',
                          color: '#64748B',
                        }}>
                          {reg.judgeCount} / {selectedEvent?.judges?.length || '?'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: reg.avgScore > 0 ? '#1E3A5F' : '#94A3B8',
                        }}>
                          {reg.avgScore > 0 ? reg.avgScore.toFixed(1) : '-'}
                        </span>
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
};

export default LiveScores;
