import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, Download, Link2, QrCode, X, CheckCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const EventQRModal = ({ isOpen, onClose, eventId, eventTitle }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('qr');

  const baseUrl = window.location.origin;
  const registrationUrl = `${baseUrl}/events/${eventId}/register`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationUrl);
      setCopied(true);
      toast.success('Registration link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('event-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = `${eventTitle || 'event'}-qr-code.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code downloaded!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleOpenLink = () => {
    window.open(registrationUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '1.5rem',
        width: '100%',
        maxWidth: '440px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'modalSlideIn 0.3s ease-out',
      }}>
        {/* Success Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: '1.25rem', height: '1.25rem', color: '#FFFFFF' }} />
          </button>

          <div style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <CheckCircle style={{ width: '2.5rem', height: '2.5rem', color: '#FFFFFF' }} />
          </div>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#FFFFFF',
            margin: '0 0 0.5rem',
          }}>
            Event Created!
          </h2>
          <p style={{
            fontSize: '0.9375rem',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
          }}>
            {eventTitle}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            padding: '0.25rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            <button
              onClick={() => setActiveTab('qr')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: activeTab === 'qr' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'qr' ? '#E91E63' : '#64748B',
                boxShadow: activeTab === 'qr' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <QrCode style={{ width: '1.125rem', height: '1.125rem' }} />
              QR Code
            </button>
            <button
              onClick={() => setActiveTab('link')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: activeTab === 'link' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'link' ? '#E91E63' : '#64748B',
                boxShadow: activeTab === 'link' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Link2 style={{ width: '1.125rem', height: '1.125rem' }} />
              Share Link
            </button>
          </div>

          {activeTab === 'qr' ? (
            <div style={{ textAlign: 'center' }}>
              {/* QR Code Container */}
              <div style={{
                display: 'inline-block',
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '1rem',
                border: '2px solid #E2E8F0',
                marginBottom: '1rem',
              }}>
                <QRCodeSVG
                  id="event-qr-code"
                  value={registrationUrl}
                  size={180}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#1E3A5F"
                />
              </div>

              <p style={{
                fontSize: '0.875rem',
                color: '#64748B',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}>
                Scan this QR code to open the<br />event registration page
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleDownloadQR}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 1rem',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Download style={{ width: '1.125rem', height: '1.125rem' }} />
                  Download QR
                </button>
                <button
                  onClick={handleOpenLink}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 1rem',
                    backgroundColor: '#E91E63',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ExternalLink style={{ width: '1.125rem', height: '1.125rem' }} />
                  Open Link
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Link Display */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '0.75rem',
                border: '1px solid #E2E8F0',
                marginBottom: '1rem',
              }}>
                <p style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}>
                  Registration Link
                </p>
                <p style={{
                  fontSize: '0.8125rem',
                  color: '#1E3A5F',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  backgroundColor: '#FFFFFF',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #E2E8F0',
                  margin: 0,
                }}>
                  {registrationUrl}
                </p>
              </div>

              <p style={{
                fontSize: '0.875rem',
                color: '#64748B',
                marginBottom: '1.5rem',
                textAlign: 'center',
                lineHeight: 1.5,
              }}>
                Share this link with participants to<br />allow them to register for the event
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleCopyLink}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 1rem',
                    backgroundColor: copied ? '#10B981' : '#FFFFFF',
                    color: copied ? '#FFFFFF' : '#1E293B',
                    border: copied ? 'none' : '1px solid #E2E8F0',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {copied ? (
                    <Check style={{ width: '1.125rem', height: '1.125rem' }} />
                  ) : (
                    <Copy style={{ width: '1.125rem', height: '1.125rem' }} />
                  )}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={handleOpenLink}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 1rem',
                    backgroundColor: '#E91E63',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ExternalLink style={{ width: '1.125rem', height: '1.125rem' }} />
                  Open Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}>
          <Sparkles style={{ width: '1rem', height: '1rem', color: '#F59E0B' }} />
          <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
            Your event is ready to accept registrations
          </span>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default EventQRModal;
