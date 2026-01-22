import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Trophy,
  Medal,
  Award,
  ChevronDown,
  Calendar,
  Star,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';

const DepartmentResults = () => {
  const { departmentSession } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [winners, setWinners] = useState([]);
  const [myResults, setMyResults] = useState([]);

  // Fetch completed events
  useEffect(() => {
    const eventsRef = collection(db, 'events');
    const eventsQuery = query(eventsRef, where('status', '==', 'completed'));

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

  // Fetch winners for selected event
  useEffect(() => {
    if (!selectedEvent) return;

    const fetchWinners = async () => {
      // First get from winners collection
      const winnersRef = collection(db, 'winners');
      const winnersQuery = query(winnersRef, where('eventId', '==', selectedEvent.id));
      const winnersSnapshot = await getDocs(winnersQuery);

      if (!winnersSnapshot.empty) {
        const winnersData = winnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        winnersData.sort((a, b) => a.rank - b.rank);
        setWinners(winnersData);
        setMyResults(winnersData.filter(w => w.departmentId === departmentSession?.departmentId));
      } else {
        // Calculate from registrations if winners not declared
        const registrationsRef = collection(db, 'registrations');
        const regQuery = query(
          registrationsRef,
          where('eventId', '==', selectedEvent.id),
          where('status', '==', 'approved')
        );
        const regSnapshot = await getDocs(regQuery);
        const regsData = regSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate scores
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

          return {
            ...reg,
            totalScore,
            avgScore: judgeCount > 0 ? totalScore / judgeCount : 0,
            judgeCount,
          };
        });

        // Sort and rank
        scoredRegs.sort((a, b) => b.avgScore - a.avgScore);
        scoredRegs.forEach((reg, index) => {
          reg.rank = index + 1;
        });

        setWinners(scoredRegs.slice(0, 10)); // Top 10
        setMyResults(scoredRegs.filter(r => r.departmentId === departmentSession?.departmentId));
      }
    };

    fetchWinners();
  }, [selectedEvent, departmentSession]);

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

  if (events.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
        <Trophy style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
        <p style={{ fontSize: '1rem', color: '#64748B', margin: 0 }}>No completed events yet</p>
        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0.5rem 0 0 0' }}>
          Results will appear here after events are completed
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Event Selection */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
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
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Department's Results */}
      {myResults.length > 0 && (
        <div style={{
          ...cardStyle,
          marginBottom: '1.5rem',
          border: '2px solid #E91E63',
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, #FFFFFF 100%)',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 1rem 0' }}>
            Your Department's Results
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myResults.map((result) => {
              const rankStyle = getRankStyle(result.rank);
              const RankIcon = rankStyle.icon;
              return (
                <div
                  key={result.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.75rem',
                    border: result.rank <= 3 ? '2px solid #E91E63' : '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '4rem',
                      height: '4rem',
                      borderRadius: '50%',
                      background: rankStyle.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: rankStyle.color,
                    }}>
                      {RankIcon ? (
                        <RankIcon style={{ width: '2rem', height: '2rem' }} />
                      ) : (
                        <span style={{ fontWeight: '700', fontSize: '1.5rem' }}>#{result.rank}</span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#E91E63', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                        {rankStyle.label}
                      </p>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                        {result.students?.map(s => s.name).join(', ') || result.participantName || 'Team'}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                        {result.performanceDetails?.songName || result.performanceDetails?.teamName || ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E3A5F', margin: 0 }}>
                      {result.avgScore?.toFixed(1) || result.score?.toFixed(1) || '-'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Winners */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 1.5rem 0' }}>
          Event Winners
        </h3>

        {winners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Trophy style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Winners not declared yet</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: '1rem',
              marginBottom: '2rem',
              paddingTop: '1rem',
            }}>
              {/* 2nd Place */}
              {winners[1] && (
                <div style={{ textAlign: 'center', width: '140px' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                  }}>
                    <Medal style={{ width: '2rem', height: '2rem', color: '#000' }} />
                  </div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
                    {winners[1].students?.[0]?.name || winners[1].participantName || 'Team'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.25rem 0' }}>
                    {winners[1].departmentCode || winners[1].departmentName}
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '700', color: '#A0A0A0', margin: 0 }}>
                    {winners[1].avgScore?.toFixed(1) || winners[1].score?.toFixed(1)}
                  </p>
                  <div style={{
                    height: '80px',
                    background: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
                    borderRadius: '0.5rem 0.5rem 0 0',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#000' }}>2</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {winners[0] && (
                <div style={{ textAlign: 'center', width: '160px' }}>
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                  }}>
                    <Trophy style={{ width: '2.5rem', height: '2.5rem', color: '#000' }} />
                  </div>
                  <p style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
                    {winners[0].students?.[0]?.name || winners[0].participantName || 'Team'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.25rem 0' }}>
                    {winners[0].departmentCode || winners[0].departmentName}
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFA500', margin: 0 }}>
                    {winners[0].avgScore?.toFixed(1) || winners[0].score?.toFixed(1)}
                  </p>
                  <div style={{
                    height: '100px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    borderRadius: '0.5rem 0.5rem 0 0',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '2rem', fontWeight: '700', color: '#000' }}>1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {winners[2] && (
                <div style={{ textAlign: 'center', width: '140px' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                  }}>
                    <Award style={{ width: '2rem', height: '2rem', color: '#FFF' }} />
                  </div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
                    {winners[2].students?.[0]?.name || winners[2].participantName || 'Team'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.25rem 0' }}>
                    {winners[2].departmentCode || winners[2].departmentName}
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '700', color: '#B87333', margin: 0 }}>
                    {winners[2].avgScore?.toFixed(1) || winners[2].score?.toFixed(1)}
                  </p>
                  <div style={{
                    height: '60px',
                    background: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
                    borderRadius: '0.5rem 0.5rem 0 0',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FFF' }}>3</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rest of the rankings */}
            {winners.length > 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {winners.slice(3).map((winner, index) => {
                  const isMyDept = winner.departmentId === departmentSession?.departmentId;
                  return (
                    <div
                      key={winner.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        backgroundColor: isMyDept ? 'rgba(233, 30, 99, 0.05)' : '#F8FAFC',
                        borderRadius: '0.5rem',
                        border: isMyDept ? '1px solid #E91E63' : '1px solid transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '50%',
                          backgroundColor: '#E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#64748B',
                        }}>
                          {index + 4}
                        </span>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                            {winner.students?.[0]?.name || winner.participantName || 'Team'}
                            {isMyDept && <Star style={{ width: '0.75rem', height: '0.75rem', color: '#E91E63', marginLeft: '0.5rem', display: 'inline' }} />}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                            {winner.departmentCode || winner.departmentName}
                          </p>
                        </div>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>
                        {winner.avgScore?.toFixed(1) || winner.score?.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentResults;
