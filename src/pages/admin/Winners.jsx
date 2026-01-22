import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Trophy,
  Medal,
  Award,
  ChevronDown,
  RefreshCw,
  Download,
  CheckCircle,
  Trash2,
  Star,
  BarChart3,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Winners = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [rankedParticipants, setRankedParticipants] = useState([]);
  const [existingWinners, setExistingWinners] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Fetch events
  useEffect(() => {
    const eventsRef = collection(db, 'events');
    const eventsQuery = query(eventsRef, where('status', 'in', ['published', 'completed']));

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
      if (eventsData.length > 0 && !selectedEvent) {
        setSelectedEvent(eventsData[0]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch registrations and scores for selected event
  useEffect(() => {
    if (!selectedEvent) return;

    const fetchData = async () => {
      try {
        // Fetch approved registrations
        const registrationsRef = collection(db, 'registrations');
        const regQuery = query(
          registrationsRef,
          where('eventId', '==', selectedEvent.id),
          where('status', '==', 'approved')
        );
        const regSnapshot = await getDocs(regQuery);
        const regsData = regSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate scores and rankings
        const scoredRegs = regsData.map(reg => {
          let totalScore = 0;
          let judgeCount = 0;
          const judgeScoresArray = [];

          if (reg.judgeScores) {
            Object.entries(reg.judgeScores).forEach(([judgeId, judgeScore]) => {
              if (judgeScore.submitted && judgeScore.totalScore !== undefined) {
                totalScore += judgeScore.totalScore;
                judgeCount++;
                judgeScoresArray.push({
                  judgeId,
                  judgeName: judgeScore.judgeName || 'Judge',
                  totalScore: judgeScore.totalScore,
                  criteriaScores: judgeScore.criteriaScores,
                });
              }
            });
          }

          const avgScore = judgeCount > 0 ? totalScore / judgeCount : 0;

          return {
            ...reg,
            totalScore,
            avgScore,
            judgeCount,
            judgeScoresArray,
          };
        });

        // Sort by average score (descending)
        scoredRegs.sort((a, b) => b.avgScore - a.avgScore);

        // Assign ranks (handling ties)
        let currentRank = 1;
        scoredRegs.forEach((reg, index) => {
          if (index > 0 && scoredRegs[index - 1].avgScore === reg.avgScore) {
            reg.rank = scoredRegs[index - 1].rank;
          } else {
            reg.rank = currentRank;
          }
          currentRank++;
        });

        setRegistrations(regsData);
        setRankedParticipants(scoredRegs);

        // Fetch existing winners
        const winnersRef = collection(db, 'winners');
        const winnersQuery = query(winnersRef, where('eventId', '==', selectedEvent.id));
        const winnersSnapshot = await getDocs(winnersQuery);
        setExistingWinners(winnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, [selectedEvent]);

  const generateWinners = async () => {
    if (rankedParticipants.length === 0) {
      toast.error('No participants with scores found');
      return;
    }

    const top3 = rankedParticipants.filter(p => p.avgScore > 0).slice(0, 3);
    if (top3.length === 0) {
      toast.error('No participants have been scored yet');
      return;
    }

    setGenerating(true);
    try {
      // Delete existing winners for this event
      const winnersRef = collection(db, 'winners');
      const existingQuery = query(winnersRef, where('eventId', '==', selectedEvent.id));
      const existingSnapshot = await getDocs(existingQuery);
      const deletePromises = existingSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Create new winner entries
      const createPromises = top3.map((participant, index) => {
        const winnerData = {
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          eventCategory: selectedEvent.category,
          registrationId: participant.id,
          departmentId: participant.departmentId,
          departmentName: participant.departmentName,
          departmentCode: participant.departmentCode,
          students: participant.students,
          performanceDetails: participant.performanceDetails || null,
          rank: index + 1,
          score: participant.avgScore,
          totalScore: participant.totalScore,
          judgeCount: participant.judgeCount,
          position: index === 0 ? 'Winner' : index === 1 ? '1st Runner-up' : '2nd Runner-up',
          createdAt: serverTimestamp(),
        };
        return addDoc(winnersRef, winnerData);
      });

      await Promise.all(createPromises);

      // Update event status to completed
      await updateDoc(doc(db, 'events', selectedEvent.id), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Refresh existing winners
      const winnersSnapshot = await getDocs(query(winnersRef, where('eventId', '==', selectedEvent.id)));
      setExistingWinners(winnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      toast.success('Winners generated successfully!');
    } catch (error) {
      console.error('Error generating winners:', error);
      toast.error('Failed to generate winners');
    } finally {
      setGenerating(false);
    }
  };

  const clearWinners = async () => {
    if (!window.confirm('Are you sure you want to clear all winners for this event?')) return;

    try {
      const winnersRef = collection(db, 'winners');
      const existingQuery = query(winnersRef, where('eventId', '==', selectedEvent.id));
      const existingSnapshot = await getDocs(existingQuery);
      const deletePromises = existingSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setExistingWinners([]);
      toast.success('Winners cleared');
    } catch (error) {
      console.error('Error clearing winners:', error);
      toast.error('Failed to clear winners');
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return {
          bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          color: '#000',
          icon: Trophy,
          label: 'Winner',
        };
      case 2:
        return {
          bg: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
          color: '#000',
          icon: Medal,
          label: '1st Runner-up',
        };
      case 3:
        return {
          bg: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
          color: '#FFF',
          icon: Award,
          label: '2nd Runner-up',
        };
      default:
        return { bg: '#F8FAFC', color: '#64748B', icon: null, label: `Rank ${rank}` };
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
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
              Winner Generation
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
              Generate winners based on judge scores
            </p>
          </div>
        </div>
      </div>

      {/* Event Selection */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ position: 'relative', minWidth: '300px' }}>
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
                    <span style={{
                      marginLeft: '0.5rem',
                      padding: '0.125rem 0.5rem',
                      backgroundColor: event.status === 'completed' ? '#D1FAE5' : '#FEF3C7',
                      color: event.status === 'completed' ? '#059669' : '#D97706',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                    }}>
                      {event.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {existingWinners.length > 0 && (
              <button
                onClick={clearWinners}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                }}
              >
                <Trash2 style={{ width: '1rem', height: '1rem' }} />
                Clear Winners
              </button>
            )}
            <button
              onClick={generateWinners}
              disabled={generating || rankedParticipants.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: generating ? '#94A3B8' : '#E91E63',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: generating ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              {generating ? (
                <>
                  <RefreshCw style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                  Generating...
                </>
              ) : (
                <>
                  <Trophy style={{ width: '1rem', height: '1rem' }} />
                  Generate Winners
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ ...cardStyle, borderLeft: '4px solid #3B82F6' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Total Participants</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{registrations.length}</p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #10B981' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Scored</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {rankedParticipants.filter(p => p.avgScore > 0).length}
          </p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #F59E0B' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Pending Scores</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {rankedParticipants.filter(p => p.avgScore === 0).length}
          </p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #E91E63' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Winners Declared</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{existingWinners.length}</p>
        </div>
      </div>

      {/* Existing Winners */}
      {existingWinners.length > 0 && (
        <div style={{
          ...cardStyle,
          marginBottom: '1.5rem',
          border: '2px solid #E91E63',
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, #FFFFFF 100%)',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
            Declared Winners
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {existingWinners.sort((a, b) => a.rank - b.rank).map((winner) => {
              const rankStyle = getRankStyle(winner.rank);
              const RankIcon = rankStyle.icon;
              return (
                <div
                  key={winner.id}
                  style={{
                    flex: '1',
                    minWidth: '200px',
                    maxWidth: '300px',
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.75rem',
                    border: '2px solid #E2E8F0',
                    textAlign: 'center',
                  }}
                >
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    background: rankStyle.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  }}>
                    {RankIcon && <RankIcon style={{ width: '2rem', height: '2rem', color: rankStyle.color }} />}
                  </div>
                  <p style={{ fontSize: '0.6875rem', color: '#E91E63', fontWeight: '600', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>
                    {rankStyle.label}
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
                    {winner.students?.[0]?.name || 'Team'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.5rem 0' }}>
                    {winner.departmentCode}
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E3A5F', margin: 0 }}>
                    {winner.score?.toFixed(1)} pts
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 1rem 0' }}>
          Score Leaderboard
        </h3>

        {rankedParticipants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <BarChart3 style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1rem', color: '#64748B', margin: 0 }}>No participants found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
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
                    Judges Scored
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Total Score
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Avg Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankedParticipants.map((participant) => {
                  const rankStyle = getRankStyle(participant.rank);
                  const isTop3 = participant.rank <= 3 && participant.avgScore > 0;
                  return (
                    <tr
                      key={participant.id}
                      style={{
                        borderBottom: '1px solid #E2E8F0',
                        backgroundColor: isTop3 ? `${rankStyle.bg}10` : 'transparent',
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          background: participant.avgScore > 0 ? rankStyle.bg : '#F8FAFC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: participant.avgScore > 0 ? rankStyle.color : '#64748B',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                        }}>
                          {participant.avgScore > 0 ? (
                            participant.rank <= 3 && rankStyle.icon ? (
                              <rankStyle.icon style={{ width: '1.25rem', height: '1.25rem' }} />
                            ) : (
                              participant.rank
                            )
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                          {participant.students?.map(s => s.name).join(', ') || 'Team'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                          {participant.performanceDetails?.songName || participant.performanceDetails?.teamName || ''}
                        </p>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#1E293B',
                        }}>
                          {participant.departmentCode}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.625rem',
                          backgroundColor: participant.judgeCount > 0 ? '#D1FAE5' : '#FEF3C7',
                          color: participant.judgeCount > 0 ? '#059669' : '#D97706',
                          borderRadius: '0.375rem',
                          fontSize: '0.8125rem',
                        }}>
                          {participant.judgeCount} / {selectedEvent?.judges?.length || '?'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: '500', color: '#64748B' }}>
                          {participant.totalScore > 0 ? participant.totalScore.toFixed(1) : '-'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: participant.avgScore > 0 ? '#1E3A5F' : '#94A3B8',
                        }}>
                          {participant.avgScore > 0 ? participant.avgScore.toFixed(1) : '-'}
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

export default Winners;
