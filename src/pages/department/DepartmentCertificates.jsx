import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
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

  /* ---------------- FETCH CERTIFICATES ---------------- */
  useEffect(() => {
    if (!departmentSession?.departmentId) return;

    const fetchCertificates = async () => {
      try {
        const winnersSnap = await getDocs(
          query(
            collection(db, 'winners'),
            where('departmentId', '==', departmentSession.departmentId)
          )
        );

        const regsSnap = await getDocs(
          query(
            collection(db, 'registrations'),
            where('departmentId', '==', departmentSession.departmentId),
            where('status', '==', 'approved')
          )
        );

        const winners = winnersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const regs = regsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const all = [];

        winners.forEach(w => {
          w.students?.forEach(s => {
            all.push({
              ...w,
              studentName: s.name,
              registerNumber: s.registerNumber,
              certificateType:
                w.rank === 1
                  ? 'Winner'
                  : w.rank === 2
                  ? '1st Runner-up'
                  : '2nd Runner-up',
            });
          });
        });

        regs.forEach(r => {
          r.students?.forEach(s => {
            const isWinner = winners.some(w =>
              w.students?.some(ws => ws.registerNumber === s.registerNumber)
            );

            if (!isWinner) {
              all.push({
                ...r,
                studentName: s.name,
                registerNumber: s.registerNumber,
                certificateType: 'Participation',
              });
            }
          });
        });

        setCertificates(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [departmentSession]);

  /* ---------------- DOWNLOAD PDF ---------------- */
  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');

      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save(`Certificate_${selectedCertificate.studentName}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Loading certificates…</p>;
  }

  return (
    <>
      {/* CERTIFICATE LIST */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
          gap: '1rem',
        }}
      >
        {certificates.map((c, i) => (
          <div
            key={i}
            onClick={() => setSelectedCertificate(c)}
            style={{
              background: '#fff',
              padding: '1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,.1)',
            }}
          >
            <h4>{c.studentName}</h4>
            <p>{c.eventTitle}</p>
            <small>{c.certificateType}</small>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedCertificate && (
        <div
          onClick={() => setSelectedCertificate(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '1rem',
              borderRadius: '12px',
            }}
          >
            <button
              onClick={downloadCertificate}
              disabled={generating}
              style={{ marginBottom: 12 }}
            >
              {generating ? 'Generating…' : 'Download PDF'}
            </button>

            {/* CERTIFICATE */}
            <div
              ref={certificateRef}
              style={{
                width: '1123px',
                height: '680px', // 🔹 Reduced height
                backgroundColor: '#FBF7F1',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'Georgia, serif',
              }}
            >
              {/* STAR / MEDAL BADGE */}
<div
  style={{
    position: 'absolute',
    top: 30,
    left: 30,
    width: 90,
    height: 110,
    zIndex: 10,
  }}
>
  <svg viewBox="0 0 90 110" fill="none">
    {/* Ribbon */}
    <path d="M25,55 L25,110 L45,95 L65,110 L65,55" fill="#D4AF37" />
    <path d="M25,55 L25,110 L45,95" fill="#C5A028" />

    {/* Medal */}
    <circle
      cx="45"
      cy="40"
      r="38"
      fill="url(#goldGradient)"
      stroke="#C5A028"
      strokeWidth="2"
    />
    <circle
      cx="45"
      cy="40"
      r="30"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1"
      opacity="0.5"
    />

    {/* Star */}
    <path
      d="M45,15 L50,30 L66,30 L53,40 L58,55 L45,46 L32,55 L37,40 L24,30 L40,30 Z"
      fill="#FFFFFF"
      opacity="0.9"
    />

    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F4D03F" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#C5A028" />
      </linearGradient>
    </defs>
  </svg>
</div>
{/* RIGHT TOP CURVED ORNAMENT – SAME AS CERTIFICATES */}
<div
  style={{
    position: 'absolute',
    top: 20,
    right: 20,
    width: 80,
    height: 80,
    zIndex: 10,
  }}
>
  <svg viewBox="0 0 80 80" fill="none">
    <path
      d="M80,0 L80,10 Q60,10 60,30 L60,80 L50,80 L50,30 Q50,0 80,0"
      stroke="#D4AF37"
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="70" cy="20" r="3" fill="#D4AF37" />
    <path
      d="M65,5 Q75,15 65,25 Q55,15 65,5"
      stroke="#D4AF37"
      strokeWidth="1"
      fill="none"
    />
  </svg>
</div>


              {/* TOP BACKGROUND */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                  background: '#5E6658',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 70,
                  left: '-5%',
                  width: '110%',
                  height: 70,
                  background: '#1E3A5F',
                  borderBottomLeftRadius: '100%',
                  borderBottomRightRadius: '100%',
                }}
              />

              {/* COLLEGE NAME */}
              <div
                style={{
                  position: 'absolute',
                  top: 95,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  color: '#FFFFFF',
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  fontFamily: 'Times New Roman, serif',
                }}
              >
                SACRED HEART COLLEGE (Autonomous), Tirupattur
              </div>

              {/* BOTTOM BACKGROUND */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                  background: '#5E6658',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 70,
                  left: '-5%',
                  width: '110%',
                  height: 70,
                  background: '#1E3A5F',
                  borderTopLeftRadius: '100%',
                  borderTopRightRadius: '100%',
                }}
              />

              {/* CONTENT */}
              <div style={{ padding: '140px 140px', textAlign: 'center' }}>
                <h1
                  style={{
                    fontSize: 48,
                    letterSpacing: 6,
                    color: '#1E3A5F',
                  }}
                >
                  CERTIFICATE
                </h1>

                <p
                  style={{
                    letterSpacing: 4,
                    color: '#D4AF37',
                    marginBottom: 30,
                  }}
                >
                  OF ACHIEVEMENT
                </p>

                <p>This certificate is proudly presented to</p>

                <h2
                  style={{
                    fontSize: 42,
                    color: '#D4AF37',
                    fontFamily: 'cursive',
                    margin: '20px 0',
                  }}
                >
                  {selectedCertificate.studentName}
                </h2>

                <div
                  style={{
                    width: 220,
                    height: 2,
                    background: '#D4AF37',
                    margin: '0 auto 25px',
                  }}
                />

                <p style={{ maxWidth: 720, margin: '0 auto', lineHeight: 1.7 }}>
                  For demonstrating exceptional dedication and outstanding
                  performance in the event.
                </p>

                <h3 style={{ marginTop: 24, color: '#1E3A5F' }}>
                  {selectedCertificate.eventTitle}
                </h3>
              </div>

{/* SIGNATURES */}
<div
  style={{
    position: 'absolute',
    bottom: 120,
    left: 120,
    right: 120,
    display: 'flex',
    justifyContent: 'space-between',
  }}
>
  {/* Event Organizer */}
  <div style={{ textAlign: 'center', width: 220 }}>
    {/* Signature Image */}
    

    {/* Signature Line */}
    <div
      style={{
        width: 180,
        height: 1,
        background: '#1E3A5F',
        margin: '0 auto 8px',
      }}
    />

    <p
      style={{
        margin: 0,
        fontWeight: 600,
        color: '#1E3A5F',
        fontSize: 14,
      }}
    >
      Event Organizer
    </p>
    <p
      style={{
        margin: 0,
        fontSize: 12,
        color: '#D4AF37',
        letterSpacing: 1,
      }}
    >
      Director of Events
    </p>
  </div>

  {/* Certificate Authority */}
  <div style={{ textAlign: 'center', width: 220 }}>
  

    {/* Signature Line */}
    <div
      style={{
        width: 180,
        height: 1,
        background: '#1E3A5F',
        margin: '0 auto 8px',
      }}
    />

    <p
      style={{
        margin: 0,
        fontWeight: 600,
        color: '#1E3A5F',
        fontSize: 14,
      }}
    >
      Certificate Authority
    </p>
    <p
      style={{
        margin: 0,
        fontSize: 12,
        color: '#D4AF37',
        letterSpacing: 1,
      }}
    >
      Head of Certification
    </p>
  </div>
</div>



              {/* FOOTER */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 35,
                  left: 60,
                  right: 60,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: '#CBD5E1',
                }}
              >
                <span>
                  Issued on {format(new Date(), 'MMMM dd, yyyy')}
                </span>
                <span>
                  Certificate No: CERT-{selectedCertificate.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentCertificates;
