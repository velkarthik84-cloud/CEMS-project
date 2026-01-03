import { useState, useEffect, useRef } from 'react';
import {
  Award,
  Download,
  Search,
  ChevronDown,
  Users,
  Trophy,
  Medal,
  Star,
  FileText,
  Printer,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Certificates = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedEventData, setSelectedEventData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [generating, setGenerating] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchParticipants();
    }
  }, [selectedEvent]);

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

  const calculateAverageScore = (scores) => {
    if (!scores || typeof scores !== 'object') return 0;
    // Handle both number and string score values
    const scoreValues = Object.values(scores)
      .map(s => typeof s === 'string' ? parseInt(s, 10) : s)
      .filter(s => typeof s === 'number' && !isNaN(s));
    if (scoreValues.length === 0) return 0;
    const total = scoreValues.reduce((sum, score) => sum + score, 0);
    return Math.round(total / scoreValues.length);
  };

  const fetchParticipants = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);

      const eventData = events.find(e => e.value === selectedEvent);
      setSelectedEventData(eventData);

      const regsRef = collection(db, 'registrations');
      const q = query(regsRef, where('eventId', '==', selectedEvent));
      const snapshot = await getDocs(q);

      const participantsList = snapshot.docs.map(doc => {
        const data = doc.data();
        // Calculate average score from all judges
        const avgScore = calculateAverageScore(data.scores);
        const judgeCount = data.scores ? Object.keys(data.scores).length : 0;

        console.log('Participant:', data.fullName, 'Scores:', data.scores, 'Avg:', avgScore);

        return {
          id: doc.id,
          ...data,
          score: avgScore,
          judgeScores: data.scores || {},
          judgeCount: judgeCount,
          certificateGenerated: data.certificateGenerated || false,
        };
      });

      // Sort by score descending
      participantsList.sort((a, b) => b.score - a.score);
      setParticipants(participantsList);

      if (showRefreshing) {
        toast.success('Data refreshed!');
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to fetch participants');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchParticipants(true);
  };

  const getCertificateType = (score, rank, totalParticipants, judgeCount = 0) => {
    if (judgeCount === 0) return { type: 'Not Scored', color: '#94A3B8', icon: FileText };
    if (rank === 1 && score > 0) return { type: 'Gold', color: '#FFD700', icon: Trophy };
    if (rank === 2 && score > 0) return { type: 'Silver', color: '#C0C0C0', icon: Medal };
    if (rank === 3 && score > 0) return { type: 'Bronze', color: '#CD7F32', icon: Medal };
    if (score >= 80) return { type: 'Excellence', color: '#8B5CF6', icon: Star };
    if (score >= 60) return { type: 'Merit', color: '#3B82F6', icon: Award };
    return { type: 'Participation', color: '#10B981', icon: CheckCircle };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return format(new Date(), 'MMMM dd, yyyy');
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMMM dd, yyyy');
  };

  const generateCertificate = async (participant, rank) => {
    setGenerating(participant.id);

    const certType = getCertificateType(participant.score, rank, participants.length);

    // Create certificate HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${participant.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600&display=swap');

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Open Sans', sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }

          .certificate {
            width: 900px;
            height: 636px;
            background: linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%);
            border-radius: 12px;
            padding: 40px;
            position: relative;
            overflow: hidden;
          }

          .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 8px solid ${certType.color};
            border-radius: 12px;
            pointer-events: none;
          }

          .certificate::after {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            pointer-events: none;
          }

          .inner {
            background: rgba(255,255,255,0.02);
            border-radius: 8px;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 30px;
            position: relative;
          }

          .badge {
            width: 80px;
            height: 80px;
            background: ${certType.color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          }

          .badge svg {
            width: 40px;
            height: 40px;
            color: ${certType.type === 'Silver' ? '#1E293B' : '#FFFFFF'};
          }

          .title {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 8px;
            letter-spacing: 4px;
            text-transform: uppercase;
          }

          .subtitle {
            font-size: 18px;
            color: ${certType.color};
            font-weight: 600;
            margin-bottom: 30px;
            letter-spacing: 2px;
          }

          .presented {
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            margin-bottom: 8px;
          }

          .name {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 20px;
            border-bottom: 2px solid ${certType.color};
            padding-bottom: 10px;
            min-width: 300px;
          }

          .description {
            font-size: 16px;
            color: rgba(255,255,255,0.8);
            max-width: 600px;
            line-height: 1.6;
            margin-bottom: 30px;
          }

          .event-name {
            font-size: 20px;
            font-weight: 600;
            color: ${certType.color};
            margin-bottom: 8px;
          }

          .score {
            font-size: 24px;
            font-weight: 700;
            color: #FFFFFF;
            margin-bottom: 30px;
          }

          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            width: 100%;
            margin-top: auto;
          }

          .signature {
            text-align: center;
          }

          .signature-line {
            width: 150px;
            border-bottom: 1px solid rgba(255,255,255,0.5);
            margin-bottom: 8px;
          }

          .signature-text {
            font-size: 12px;
            color: rgba(255,255,255,0.6);
          }

          .date {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
          }

          .cert-id {
            font-size: 10px;
            color: rgba(255,255,255,0.4);
            position: absolute;
            bottom: 15px;
            right: 20px;
          }

          @media print {
            body { background: white; padding: 0; }
            .certificate { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="inner">
            <div class="badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${certType.type === 'Gold' || certType.type === 'Silver' || certType.type === 'Bronze'
                  ? '<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>'
                  : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}
              </svg>
            </div>

            <h1 class="title">Certificate</h1>
            <p class="subtitle">of ${certType.type}</p>

            <p class="presented">This is to certify that</p>
            <h2 class="name">${participant.fullName}</h2>

            <p class="description">
              has successfully participated and demonstrated outstanding performance in
            </p>

            <p class="event-name">${selectedEventData?.title || 'Event'}</p>
            <p class="score">Score: ${participant.score}/100 ${rank <= 3 ? `• Rank: #${rank}` : ''}</p>

            <div class="footer">
              <div class="signature">
                <div class="signature-line"></div>
                <p class="signature-text">Event Organizer</p>
              </div>
              <div class="date">
                Issued on: ${formatDate(selectedEventData?.eventDate)}
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <p class="signature-text">Certificate Authority</p>
              </div>
            </div>

            <p class="cert-id">Certificate ID: CERT-${participant.registrationId || participant.id.slice(0,8).toUpperCase()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing/saving
    const printWindow = window.open('', '_blank');
    printWindow.document.write(certificateHTML);
    printWindow.document.close();

    // Update participant record
    try {
      await updateDoc(doc(db, 'registrations', participant.id), {
        certificateGenerated: true,
        certificateType: certType.type,
        certificateGeneratedAt: serverTimestamp(),
      });

      setParticipants(participants.map(p =>
        p.id === participant.id ? { ...p, certificateGenerated: true } : p
      ));

      toast.success(`Certificate generated for ${participant.fullName}`);
    } catch (error) {
      console.error('Error updating certificate status:', error);
    }

    setGenerating(null);
  };

  const generateAllCertificates = async () => {
    const scoredParticipants = participants.filter(p => p.judgeCount > 0);
    if (scoredParticipants.length === 0) {
      toast.error('No participants have been scored yet');
      return;
    }
    for (let i = 0; i < scoredParticipants.length; i++) {
      const participant = scoredParticipants[i];
      const rank = participants.findIndex(p => p.id === participant.id) + 1;
      await generateCertificate(participant, rank);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast.success(`${scoredParticipants.length} certificates generated!`);
  };

  const filteredParticipants = participants.filter(p =>
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Styles
  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  const statCardStyle = {
    ...cardStyle,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    paddingLeft: '2.5rem',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#1E293B',
    outline: 'none',
  };

  const selectStyle = {
    padding: '0.75rem 2.5rem 0.75rem 1rem',
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
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    backgroundColor: '#E91E63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const outlineButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    border: '1px solid #E2E8F0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            Certificates
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Generate score-based certificates for participants
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1.25rem' }}>
            <div style={statCardStyle}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users style={{ width: '1.5rem', height: '1.5rem', color: '#8B5CF6' }} />
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
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Trophy style={{ width: '1.5rem', height: '1.5rem', color: '#FFD700' }} />
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                  {participants.filter(p => p.judgeCount > 0).length}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Scored by Judges</p>
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Award style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                  {participants.filter(p => p.certificateGenerated).length}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Certificates Issued</p>
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Star style={{ width: '1.5rem', height: '1.5rem', color: '#E91E63' }} />
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                  {(() => {
                    const scoredParticipants = participants.filter(p => p.judgeCount > 0);
                    if (scoredParticipants.length === 0) return '-';
                    return Math.round(scoredParticipants.reduce((a, b) => a + b.score, 0) / scoredParticipants.length);
                  })()}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Avg. Score</p>
              </div>
            </div>
          </div>

          {/* Filters & Actions */}
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', maxWidth: '24rem', minWidth: '200px' }}>
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
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  ...outlineButtonStyle,
                  opacity: refreshing ? 0.7 : 1,
                }}
              >
                <RefreshCw style={{
                  width: '1rem',
                  height: '1rem',
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                }} />
                {refreshing ? 'Refreshing...' : 'Refresh Scores'}
              </button>
              <button
                onClick={generateAllCertificates}
                disabled={participants.filter(p => p.judgeCount > 0).length === 0}
                style={{ ...buttonStyle, opacity: participants.filter(p => p.judgeCount > 0).length === 0 ? 0.5 : 1 }}
              >
                <Printer style={{ width: '1rem', height: '1rem' }} />
                Generate All ({participants.filter(p => p.judgeCount > 0).length} scored)
              </button>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>

          {/* Participants Table */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                Participants & Scores
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Rank</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Participant</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Score</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Certificate Type</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.length > 0 ? (
                    filteredParticipants.map((participant, index) => {
                      const rank = participants.findIndex(p => p.id === participant.id) + 1;
                      const certType = getCertificateType(participant.score, rank, participants.length, participant.judgeCount);
                      const CertIcon = certType.icon;

                      return (
                        <tr key={participant.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{
                              width: '2rem',
                              height: '2rem',
                              borderRadius: '50%',
                              backgroundColor: rank <= 3 ? certType.color : '#F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '0.875rem',
                              color: rank <= 3 ? (rank === 2 ? '#1E293B' : '#FFFFFF') : '#64748B',
                            }}>
                              {rank}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div>
                              <p style={{ fontWeight: '500', color: '#1E293B', margin: 0 }}>{participant.fullName}</p>
                              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>{participant.email}</p>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            {participant.judgeCount > 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                  width: '100px',
                                  height: '8px',
                                  backgroundColor: '#F1F5F9',
                                  borderRadius: '4px',
                                  overflow: 'hidden',
                                }}>
                                  <div style={{
                                    width: `${participant.score}%`,
                                    height: '100%',
                                    backgroundColor: certType.color,
                                    borderRadius: '4px',
                                  }} />
                                </div>
                                <span style={{ fontWeight: '600', color: '#1E293B' }}>{participant.score}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                  ({participant.judgeCount} judge{participant.judgeCount > 1 ? 's' : ''})
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Not scored yet</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              padding: '0.25rem 0.75rem',
                              backgroundColor: `${certType.color}20`,
                              color: certType.color,
                              borderRadius: '1rem',
                              fontSize: '0.8125rem',
                              fontWeight: '500',
                            }}>
                              <CertIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                              {certType.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            {participant.certificateGenerated ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                color: '#10B981',
                                fontSize: '0.8125rem',
                              }}>
                                <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                                Issued
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>Pending</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            {participant.judgeCount > 0 ? (
                              <button
                                onClick={() => generateCertificate(participant, rank)}
                                disabled={generating === participant.id}
                                style={{
                                  ...outlineButtonStyle,
                                  padding: '0.5rem 1rem',
                                  fontSize: '0.8125rem',
                                  opacity: generating === participant.id ? 0.7 : 1,
                                }}
                              >
                                <Download style={{ width: '0.875rem', height: '0.875rem' }} />
                                {generating === participant.id ? 'Generating...' : 'Generate'}
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Awaiting score</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                        {participants.length === 0 ? 'No participants with scores found' : 'No matching participants'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Certificate Types Legend */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>
              Certificate Types
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {[
                { type: 'Gold', color: '#FFD700', desc: 'Rank #1' },
                { type: 'Silver', color: '#C0C0C0', desc: 'Rank #2' },
                { type: 'Bronze', color: '#CD7F32', desc: 'Rank #3' },
                { type: 'Excellence', color: '#8B5CF6', desc: 'Score 80+' },
                { type: 'Merit', color: '#3B82F6', desc: 'Score 60-79' },
                { type: 'Participation', color: '#10B981', desc: 'All participants' },
              ].map(item => (
                <div key={item.type} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '0.5rem',
                }}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                  }} />
                  <span style={{ fontWeight: '500', color: '#1E293B' }}>{item.type}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>({item.desc})</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem' }}>
          <Award style={{ width: '4rem', height: '4rem', color: '#CBD5E1', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1E293B', marginBottom: '0.5rem' }}>
            Select an Event
          </h3>
          <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>
            Choose an event from the dropdown to view participants and generate score-based certificates
          </p>
        </div>
      )}
    </div>
  );
};

export default Certificates;
