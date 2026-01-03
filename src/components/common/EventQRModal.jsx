import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, Download, Link2, QrCode } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import toast from 'react-hot-toast';

const EventQRModal = ({ isOpen, onClose, eventId, eventTitle }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'link'

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

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  };

  const tabsStyle = {
    display: 'flex',
    gap: '0.5rem',
    backgroundColor: '#F1F5F9',
    padding: '0.25rem',
    borderRadius: '0.5rem',
    width: '100%',
    maxWidth: '300px',
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
    color: isActive ? '#1E3A5F' : '#64748B',
    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
    transition: 'all 0.2s ease',
  });

  const qrContainerStyle = {
    padding: '1.5rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    border: '1px solid #E2E8F0',
  };

  const linkBoxStyle = {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const linkTextStyle = {
    flex: 1,
    fontSize: '0.875rem',
    color: '#1E3A5F',
    wordBreak: 'break-all',
    fontFamily: 'monospace',
  };

  const infoTextStyle = {
    fontSize: '0.875rem',
    color: '#64748B',
    textAlign: 'center',
    maxWidth: '320px',
  };

  const actionsStyle = {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Event Registration" size="md">
      <div style={containerStyle}>
        {/* Event Title */}
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E3A5F', textAlign: 'center' }}>
          {eventTitle}
        </h3>

        {/* Tabs */}
        <div style={tabsStyle}>
          <button style={tabStyle(activeTab === 'qr')} onClick={() => setActiveTab('qr')}>
            <QrCode style={{ width: '1rem', height: '1rem' }} />
            QR Code
          </button>
          <button style={tabStyle(activeTab === 'link')} onClick={() => setActiveTab('link')}>
            <Link2 style={{ width: '1rem', height: '1rem' }} />
            Link
          </button>
        </div>

        {activeTab === 'qr' ? (
          <>
            {/* QR Code */}
            <div style={qrContainerStyle}>
              <QRCodeSVG
                id="event-qr-code"
                value={registrationUrl}
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#1E3A5F"
              />
            </div>

            <p style={infoTextStyle}>
              Scan this QR code to open the event registration page
            </p>

            {/* QR Actions */}
            <div style={actionsStyle}>
              <Button variant="outline" icon={Download} onClick={handleDownloadQR}>
                Download QR
              </Button>
              <Button variant="primary" icon={ExternalLink} onClick={handleOpenLink}>
                Open Link
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Link Display */}
            <div style={linkBoxStyle}>
              <Link2 style={{ width: '1.25rem', height: '1.25rem', color: '#64748B', flexShrink: 0 }} />
              <span style={linkTextStyle}>{registrationUrl}</span>
            </div>

            <p style={infoTextStyle}>
              Share this link with participants to allow them to register for the event
            </p>

            {/* Link Actions */}
            <div style={actionsStyle}>
              <Button
                variant="outline"
                icon={copied ? Check : Copy}
                onClick={handleCopyLink}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button variant="primary" icon={ExternalLink} onClick={handleOpenLink}>
                Open Link
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default EventQRModal;
