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

    const certType = getCertificateType(participant.score, rank, participants.length, participant.judgeCount);

    // Generate unique certificate number
    const certNumber = `CERT-${Date.now().toString(36).toUpperCase()}-${participant.id.slice(0,4).toUpperCase()}`;

    // Create certificate HTML with elegant blue and gold design
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${participant.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Great+Vibes&family=Open+Sans:wght@400;600;700&display=swap');

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
            background: linear-gradient(135deg, #FAF8F5 0%, #F5F0E8 100%);
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          }

          /* Top decorative wave */
          .top-wave {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 120px;
          }

          .top-wave svg {
            width: 100%;
            height: 100%;
          }

          /* Bottom decorative wave */
          .bottom-wave {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 100px;
          }

          .bottom-wave svg {
            width: 100%;
            height: 100%;
          }

          /* Gold medal badge */
          .medal-badge {
            position: absolute;
            top: 30px;
            left: 30px;
            width: 90px;
            height: 110px;
            z-index: 10;
          }

          /* Corner ornament top right */
          .corner-ornament-tr {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 80px;
            height: 80px;
            z-index: 10;
          }

          /* Corner ornament bottom left */
          .corner-ornament-bl {
            position: absolute;
            bottom: 20px;
            left: 20px;
            width: 80px;
            height: 80px;
            z-index: 10;
          }

          /* Inner border frame */
          .inner-frame {
            position: absolute;
            top: 100px;
            right: 25px;
            bottom: 80px;
            left: 130px;
            border: 1px solid #D4AF37;
            opacity: 0.3;
          }

          .content {
            position: relative;
            z-index: 5;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 80px;
            text-align: center;
          }

          .title {
            font-family: 'Playfair Display', serif;
            font-size: 52px;
            font-weight: 700;
            color: #1E3A5F;
            letter-spacing: 8px;
            text-transform: uppercase;
            margin-bottom: 0;
          }

          .subtitle {
            font-family: 'Open Sans', sans-serif;
            font-size: 20px;
            color: #D4AF37;
            font-weight: 600;
            letter-spacing: 6px;
            text-transform: uppercase;
            margin-bottom: 30px;
          }

          .presented {
            font-family: 'Open Sans', sans-serif;
            font-size: 16px;
            color: #4A5568;
            margin-bottom: 15px;
          }

          .name {
            font-family: 'Great Vibes', cursive;
            font-size: 56px;
            color: #D4AF37;
            margin-bottom: 10px;
            line-height: 1.2;
          }

          .name-underline {
            width: 400px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #D4AF37, #D4AF37, transparent);
            margin: 0 auto 25px;
          }

          .description {
            font-family: 'Open Sans', sans-serif;
            font-size: 14px;
            color: #4A5568;
            max-width: 550px;
            line-height: 1.8;
            margin-bottom: 15px;
          }

          .event-name {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-weight: 700;
            color: #1E3A5F;
            margin-bottom: 5px;
          }

          .score-badge {
            display: inline-block;
            padding: 8px 24px;
            background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%);
            color: #FFFFFF;
            font-weight: 700;
            font-size: 14px;
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
          }

          .signatures {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            width: 100%;
            max-width: 600px;
            margin-top: auto;
          }

          .signature {
            text-align: center;
            min-width: 180px;
          }

          .signature-line {
            width: 160px;
            border-bottom: 1px solid #1E3A5F;
            margin-bottom: 8px;
          }

          .signature-name {
            font-family: 'Open Sans', sans-serif;
            font-size: 14px;
            font-weight: 700;
            color: #1E3A5F;
            margin-bottom: 2px;
          }

          .signature-title {
            font-family: 'Open Sans', sans-serif;
            font-size: 12px;
            color: #D4AF37;
            font-weight: 600;
          }

          .cert-number {
            position: absolute;
            bottom: 25px;
            right: 30px;
            font-family: 'Open Sans', sans-serif;
            font-size: 10px;
            color: #94A3B8;
            letter-spacing: 1px;
          }

          .issue-date {
            position: absolute;
            bottom: 25px;
            left: 140px;
            font-family: 'Open Sans', sans-serif;
            font-size: 10px;
            color: #94A3B8;
          }

          @media print {
            body { background: white; padding: 0; }
            .certificate { margin: 0; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <!-- Top decorative wave -->
          <div class="top-wave">
            <svg viewBox="0 0 900 120" preserveAspectRatio="none">
              <path d="M0,0 L900,0 L900,60 Q750,120 450,80 Q150,40 0,100 Z" fill="#1E3A5F"/>
              <path d="M0,0 L900,0 L900,50 Q720,100 400,70 Q80,40 0,90 Z" fill="#D4AF37" opacity="0.3"/>
            </svg>
          </div>

          <!-- Bottom decorative wave -->
          <div class="bottom-wave">
            <svg viewBox="0 0 900 100" preserveAspectRatio="none">
              <path d="M0,100 L900,100 L900,40 Q750,0 450,30 Q150,60 0,10 Z" fill="#1E3A5F"/>
              <path d="M0,100 L900,100 L900,50 Q720,10 400,35 Q80,60 0,20 Z" fill="#D4AF37" opacity="0.3"/>
            </svg>
          </div>

          <!-- Gold Medal Badge -->
          <div class="medal-badge">
            <svg viewBox="0 0 90 110" fill="none">
              <!-- Ribbon -->
              <path d="M25,55 L25,110 L45,95 L65,110 L65,55" fill="#D4AF37"/>
              <path d="M25,55 L25,110 L45,95" fill="#C5A028"/>
              <!-- Medal circle -->
              <circle cx="45" cy="40" r="38" fill="url(#goldGradient)" stroke="#C5A028" stroke-width="2"/>
              <circle cx="45" cy="40" r="30" fill="none" stroke="#FFFFFF" stroke-width="1" opacity="0.5"/>
              <!-- Star in medal -->
              <path d="M45,15 L50,30 L66,30 L53,40 L58,55 L45,46 L32,55 L37,40 L24,30 L40,30 Z" fill="#FFFFFF" opacity="0.9"/>
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#F4D03F"/>
                  <stop offset="50%" style="stop-color:#D4AF37"/>
                  <stop offset="100%" style="stop-color:#C5A028"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <!-- Corner ornament top right -->
          <div class="corner-ornament-tr">
            <svg viewBox="0 0 80 80" fill="none">
              <path d="M80,0 L80,10 Q60,10 60,30 L60,80 L50,80 L50,30 Q50,0 80,0" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
              <circle cx="70" cy="20" r="3" fill="#D4AF37"/>
              <path d="M65,5 Q75,15 65,25 Q55,15 65,5" stroke="#D4AF37" stroke-width="1" fill="none"/>
            </svg>
          </div>

          <!-- Corner ornament bottom left -->
          <div class="corner-ornament-bl">
            <svg viewBox="0 0 80 80" fill="none">
              <path d="M0,80 L0,70 Q20,70 20,50 L20,0 L30,0 L30,50 Q30,80 0,80" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
              <circle cx="10" cy="60" r="3" fill="#D4AF37"/>
              <path d="M15,75 Q5,65 15,55 Q25,65 15,75" stroke="#D4AF37" stroke-width="1" fill="none"/>
            </svg>
          </div>

          <div class="content">
            <h1 class="title">Certificate</h1>
            <p class="subtitle">of ${certType.type}</p>

            <p class="presented">This certificate is proudly presented to</p>
            <h2 class="name">${participant.fullName}</h2>
            <div class="name-underline"></div>

            <p class="description">
              For demonstrating exceptional dedication and outstanding performance in the event.
              This achievement reflects commitment to excellence and remarkable accomplishment.
            </p>

            <p class="event-name">${selectedEventData?.title || 'Event'}</p>
            <div class="score-badge">
              Score: ${participant.score}/100 ${rank <= 3 ? ` | Rank #${rank}` : ''}
            </div>

            <div class="signatures">
              <div class="signature">
                <div class="signature-line"></div>
                <p class="signature-name">Event Organizer</p>
                <p class="signature-title">Director of Events</p>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <p class="signature-name">Certificate Authority</p>
                <p class="signature-title">Head of Certification</p>
              </div>
            </div>
          </div>

          <p class="issue-date">Issued on: ${formatDate(selectedEventData?.eventDate)}</p>
          <p class="cert-number">Certificate No: ${certNumber}</p>
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
