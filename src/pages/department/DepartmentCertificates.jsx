import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Award,
  Download,
  ChevronDown,
  FileText,
  Printer,
  Trophy,
  Medal,
} from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DepartmentCertificates = () => {
  const { departmentSession } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    if (!departmentSession?.departmentId) return;

    const fetchCertificates = async () => {
      try {
        // Fetch winners for this department
        const winnersRef = collection(db, 'winners');
        const winnersQuery = query(
          winnersRef,
          where('departmentId', '==', departmentSession.departmentId)
        );
        const winnersSnapshot = await getDocs(winnersQuery);
        const winnersData = winnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'winner' }));

        // Fetch all approved registrations for participation certificates
        const registrationsRef = collection(db, 'registrations');
        const regQuery = query(
          registrationsRef,
          where('departmentId', '==', departmentSession.departmentId),
          where('status', '==', 'approved')
        );
        const regSnapshot = await getDocs(regQuery);
        const regsData = regSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'participation' }));

        // Combine and add event details
        const allCerts = [];

        // Add winner certificates
        winnersData.forEach(winner => {
          allCerts.push({
            ...winner,
            certificateType: winner.rank === 1 ? 'Winner' : winner.rank === 2 ? '1st Runner-up' : '2nd Runner-up',
          });
        });

        // Add participation certificates for those who didn't win
        regsData.forEach(reg => {
          const isWinner = winnersData.some(w =>
            w.registrationId === reg.id || w.registrationId === reg.registrationId
          );
          if (!isWinner) {
            reg.students?.forEach(student => {
              allCerts.push({
                ...reg,
                studentName: student.name,
                registerNumber: student.registerNumber,
                certificateType: 'Participation',
              });
            });
          }
        });

        // Also add student-specific winner certificates
        winnersData.forEach(winner => {
          if (winner.students) {
            winner.students.forEach(student => {
              allCerts.push({
                ...winner,
                studentName: student.name,
                registerNumber: student.registerNumber,
                certificateType: winner.rank === 1 ? 'Winner' : winner.rank === 2 ? '1st Runner-up' : '2nd Runner-up',
              });
            });
          }
        });

        setCertificates(allCerts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [departmentSession]);

  const downloadCertificate = async () => {
    if (!certificateRef.current || !selectedCertificate) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${selectedCertificate.studentName || 'Team'}_${selectedCertificate.eventTitle}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getCertificateIcon = (type) => {
    switch (type) {
      case 'Winner':
        return Trophy;
      case '1st Runner-up':
      case '2nd Runner-up':
        return Medal;
      default:
        return Award;
    }
  };

  const getCertificateColor = (type) => {
    switch (type) {
      case 'Winner':
        return '#FFD700';
      case '1st Runner-up':
        return '#C0C0C0';
      case '2nd Runner-up':
        return '#CD7F32';
      default:
        return '#E91E63';
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
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
          Available Certificates
        </h3>
        <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
          Download certificates for your department's event participations
        </p>
      </div>

      {certificates.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <Award style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem', color: '#64748B', margin: 0 }}>No certificates available</p>
          <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0.5rem 0 0 0' }}>
            Certificates will appear after events are completed
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {certificates.map((cert, index) => {
            const CertIcon = getCertificateIcon(cert.certificateType);
            const certColor = getCertificateColor(cert.certificateType);
            return (
              <div
                key={`${cert.id}-${index}`}
                style={{
                  ...cardStyle,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid #E2E8F0',
                }}
                onClick={() => setSelectedCertificate(cert)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    backgroundColor: `${certColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <CertIcon style={{ width: '1.5rem', height: '1.5rem', color: certColor }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      backgroundColor: `${certColor}20`,
                      color: certColor,
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                    }}>
                      {cert.certificateType}
                    </span>
                    <h4 style={{
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: '#1E293B',
                      margin: '0 0 0.25rem 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {cert.studentName || cert.students?.[0]?.name || 'Team'}
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 0.25rem 0' }}>
                      {cert.eventTitle}
                    </p>
                    {cert.registerNumber && (
                      <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                        {cert.registerNumber}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    color: '#1E293B',
                    marginTop: '1rem',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCertificate(cert);
                  }}
                >
                  <Download style={{ width: '1rem', height: '1rem' }} />
                  Download Certificate
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCertificate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
          onClick={() => setSelectedCertificate(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '1000px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                Certificate Preview
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={downloadCertificate}
                  disabled={generating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1rem',
                    backgroundColor: '#E91E63',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    opacity: generating ? 0.7 : 1,
                  }}
                >
                  {generating ? (
                    <>
                      <div style={{
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#FFFFFF',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download style={{ width: '1rem', height: '1rem' }} />
                      Download PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: '#F8FAFC',
                    color: '#64748B',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Certificate Template */}
            <div
              ref={certificateRef}
              style={{
                width: '100%',
                aspectRatio: '1.414',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                border: '8px solid #1E3A5F',
                borderRadius: '0.5rem',
                padding: '3rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative Border */}
              <div style={{
                position: 'absolute',
                inset: '12px',
                border: '2px solid #E91E63',
                borderRadius: '0.25rem',
                pointerEvents: 'none',
              }} />

              {/* Corner Decorations */}
              {[
                { top: '20px', left: '20px' },
                { top: '20px', right: '20px' },
                { bottom: '20px', left: '20px' },
                { bottom: '20px', right: '20px' },
              ].map((pos, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${getCertificateColor(selectedCertificate.certificateType)}40 0%, transparent 70%)`,
                    ...pos,
                  }}
                />
              ))}

              {/* Content */}
              <div style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                {/* Logo/Icon */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${getCertificateColor(selectedCertificate.certificateType)} 0%, ${getCertificateColor(selectedCertificate.certificateType)}CC 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  boxShadow: `0 4px 20px ${getCertificateColor(selectedCertificate.certificateType)}40`,
                }}>
                  {(() => {
                    const Icon = getCertificateIcon(selectedCertificate.certificateType);
                    return <Icon style={{ width: '2.5rem', height: '2.5rem', color: '#FFFFFF' }} />;
                  })()}
                </div>

                {/* Title */}
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#1E3A5F',
                  margin: '0 0 0.5rem 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                }}>
                  Certificate
                </h1>
                <p style={{
                  fontSize: '1.25rem',
                  color: '#64748B',
                  margin: '0 0 2rem 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                }}>
                  of {selectedCertificate.certificateType}
                </p>

                {/* Recipient */}
                <p style={{ fontSize: '1rem', color: '#64748B', margin: '0 0 0.5rem 0' }}>
                  This is to certify that
                </p>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#E91E63',
                  margin: '0 0 0.5rem 0',
                  borderBottom: '2px solid #E91E63',
                  paddingBottom: '0.5rem',
                }}>
                  {selectedCertificate.studentName || selectedCertificate.students?.[0]?.name || 'Team Name'}
                </h2>
                {selectedCertificate.registerNumber && (
                  <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: '0 0 1rem 0' }}>
                    ({selectedCertificate.registerNumber})
                  </p>
                )}
                <p style={{ fontSize: '1rem', color: '#64748B', margin: '0 0 0.5rem 0' }}>
                  from <strong style={{ color: '#1E3A5F' }}>{selectedCertificate.departmentName}</strong>
                </p>

                {/* Event Details */}
                <p style={{ fontSize: '1rem', color: '#64748B', margin: '1rem 0 0 0' }}>
                  has successfully participated in
                </p>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1E3A5F',
                  margin: '0.5rem 0',
                }}>
                  {selectedCertificate.eventTitle}
                </h3>
                {selectedCertificate.rank && selectedCertificate.rank <= 3 && (
                  <p style={{
                    fontSize: '1.125rem',
                    color: getCertificateColor(selectedCertificate.certificateType),
                    fontWeight: '600',
                    margin: '0.5rem 0',
                  }}>
                    Secured {selectedCertificate.certificateType} Position
                  </p>
                )}

                {/* Date & Signature */}
                <div style={{
                  position: 'absolute',
                  bottom: '2rem',
                  left: '3rem',
                  right: '3rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: '#1E293B', margin: 0, fontWeight: '500' }}>
                      {format(new Date(), 'MMMM dd, yyyy')}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>Date</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '150px',
                      borderBottom: '1px solid #1E293B',
                      marginBottom: '0.25rem',
                    }} />
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Authorized Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentCertificates;
