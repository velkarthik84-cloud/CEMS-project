import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  CreditCard,
  QrCode,
  Download,
  CheckCircle,
  Clock,
  FileText,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ParticipantDetails = () => {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchData();
  }, [participantId]);

  const fetchData = async () => {
    try {
      const regRef = doc(db, 'registrations', participantId);
      const regSnap = await getDoc(regRef);

      if (regSnap.exists()) {
        const regData = { id: regSnap.id, ...regSnap.data() };
        setRegistration(regData);

        if (regData.eventId) {
          const eventRef = doc(db, 'events', regData.eventId);
          const eventSnap = await getDoc(eventRef);
          if (eventSnap.exists()) {
            setEvent({ id: eventSnap.id, ...eventSnap.data() });
          }
        }
      } else {
        toast.error('Registration not found');
        navigate('/admin/participants');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy • hh:mm a');
  };

  const handleCheckIn = async () => {
    try {
      await updateDoc(doc(db, 'registrations', participantId), {
        attendanceStatus: 'checked_in',
        checkedInAt: serverTimestamp(),
      });
      setRegistration({
        ...registration,
        attendanceStatus: 'checked_in',
        checkedInAt: new Date(),
      });
      toast.success('Check-in successful!');
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const collectPayment = async () => {
    if (!registration || registration.amount <= 0) return;

    setProcessingPayment(true);
    const res = await loadRazorpay();
    if (!res) {
      toast.error('Failed to load payment gateway');
      setProcessingPayment(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: registration.amount * 100,
      currency: 'INR',
      name: 'Ventixe Events',
      description: `Payment for ${event?.title || 'Event'}`,
      handler: async (response) => {
        try {
          await updateDoc(doc(db, 'registrations', participantId), {
            paymentStatus: 'completed',
            paymentId: response.razorpay_payment_id,
            paidAt: serverTimestamp(),
          });

          await addDoc(collection(db, 'payments'), {
            registrationId: participantId,
            eventId: registration.eventId,
            // amount: registration.amount,
            currency: 'INR',
            status: 'completed',
            razorpayPaymentId: response.razorpay_payment_id,
            collectedAt: 'admin',
            createdAt: serverTimestamp(),
          });

          setRegistration({
            ...registration,
            paymentStatus: 'completed',
            paymentId: response.razorpay_payment_id,
          });

          toast.success('Payment collected successfully!');
        } catch (error) {
          console.error('Error updating payment:', error);
          toast.error('Payment recorded but update failed');
        } finally {
          setProcessingPayment(false);
        }
      },
      modal: {
        ondismiss: () => setProcessingPayment(false),
      },
      prefill: {
        name: registration.fullName,
        email: registration.email,
        contact: registration.mobile,
      },
      theme: { color: '#E91E63' },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const markAsPaid = async () => {
    try {
      await updateDoc(doc(db, 'registrations', participantId), {
        paymentStatus: 'completed',
        paymentId: `CASH_${Date.now()}`,
        paidAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'payments'), {
        registrationId: participantId,
        eventId: registration.eventId,
        amount: registration.amount,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'cash',
        collectedAt: 'admin',
        createdAt: serverTimestamp(),
      });

      setRegistration({
        ...registration,
        paymentStatus: 'completed',
      });

      toast.success('Payment marked as received!');
    } catch (error) {
      console.error('Error marking payment:', error);
      toast.error('Failed to update payment status');
    }
  };

  // Styles
  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  const labelStyle = {
    fontSize: '0.8125rem',
    color: '#64748B',
    marginBottom: '0.25rem',
  };

  const valueStyle = {
    fontSize: '0.9375rem',
    fontWeight: '500',
    color: '#1E293B',
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

  const successButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#10B981',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid #F1F5F9',
          borderTopColor: '#E91E63',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!registration) return null;

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/admin/participants')}
          style={{
            padding: '0.5rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '0.5rem',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            Participant Details
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Registration ID: <span style={{ fontFamily: 'monospace' }}>{registration.registrationId}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {registration.attendanceStatus !== 'checked_in' && (
            <button onClick={handleCheckIn} style={successButtonStyle}>
              <CheckCircle style={{ width: '1rem', height: '1rem' }} />
              Mark Check-in
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lg:grid-cols-3">
        {/* Main Content */}
        <div style={{ gridColumn: 'span 2' }} className="lg:col-span-2">
          {/* Personal Information */}
          <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
              Personal Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <p style={labelStyle}>Full Name</p>
                <p style={valueStyle}>{registration.fullName}</p>
              </div>
              <div>
                <p style={labelStyle}>Email Address</p>
                <p style={valueStyle}>{registration.email}</p>
              </div>
              <div>
                <p style={labelStyle}>Mobile Number</p>
                <p style={valueStyle}>{registration.mobile}</p>
              </div>
              <div>
                <p style={labelStyle}>Organization</p>
                <p style={valueStyle}>{registration.organization || '-'}</p>
              </div>
              {registration.address && (
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={labelStyle}>Address</p>
                  <p style={valueStyle}>{registration.address}</p>
                </div>
              )}
              {registration.emergencyContact && (
                <div>
                  <p style={labelStyle}>Emergency Contact</p>
                  <p style={valueStyle}>{registration.emergencyContact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Information */}
          {event && (
            <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
                Event Information
              </h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#F1F5F9',
                }}>
                  {event.bannerUrl ? (
                    <img src={event.bannerUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar style={{ width: '2rem', height: '2rem', color: '#94A3B8' }} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem' }}>{event.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>
                    <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                    {formatDate(event.eventDate)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>
                    <Clock style={{ width: '0.875rem', height: '0.875rem' }} />
                    {event.startTime} - {event.endTime}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748B' }}>
                    <MapPin style={{ width: '0.875rem', height: '0.875rem' }} />
                    {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
              Payment Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Payment Status</span>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  backgroundColor: registration.paymentStatus === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: registration.paymentStatus === 'completed' ? '#10B981' : '#F59E0B',
                }}>
                  {registration.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Amount</span>
                <span style={{ fontWeight: '600', color: registration.amount > 0 ? '#E91E63' : '#10B981', fontSize: '1.125rem' }}>
                  {registration.amount > 0 ? `₹${registration.amount}` : 'FREE'}
                </span>
              </div>
              {registration.paymentId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem' }}>
                  <span style={{ color: '#64748B' }}>Payment ID</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#1E293B' }}>
                    {registration.paymentId}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Registered On</span>
                <span style={{ color: '#1E293B' }}>{formatDate(registration.createdAt)}</span>
              </div>

              {/* Payment Actions */}
              {registration.amount > 0 && registration.paymentStatus !== 'completed' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={collectPayment}
                    disabled={processingPayment}
                    style={{ ...buttonStyle, flex: 1, justifyContent: 'center', opacity: processingPayment ? 0.7 : 1 }}
                  >
                    <CreditCard style={{ width: '1rem', height: '1rem' }} />
                    {processingPayment ? 'Processing...' : 'Collect Payment (Online)'}
                  </button>
                  <button onClick={markAsPaid} style={{ ...outlineButtonStyle, color: '#10B981', borderColor: '#10B981' }}>
                    Cash Received
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ID Proof */}
          {registration.idProofUrl && (
            <div style={cardStyle}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
                ID Proof
              </h2>
              <a
                href={registration.idProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#E91E63',
                  textDecoration: 'none',
                  fontWeight: '500',
                }}
              >
                <ExternalLink style={{ width: '1rem', height: '1rem' }} />
                View/Download ID Proof
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* QR Code */}
          <div style={{ ...cardStyle, textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>
              Entry QR Code
            </h2>
            <div style={{
              display: 'inline-block',
              padding: '1rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '0.75rem',
              border: '2px solid #E2E8F0',
            }}>
              <QRCodeSVG
                value={`VENTIXE:${registration.eventId}:${registration.registrationId}`}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '1rem' }}>
              Scan this code for check-in
            </p>
          </div>

          {/* Attendance Status */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem', textAlign: 'center' }}>
              Attendance Status
            </h2>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              {registration.attendanceStatus === 'checked_in' ? (
                <>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}>
                    <CheckCircle style={{ width: '2rem', height: '2rem', color: '#10B981' }} />
                  </div>
                  <p style={{ fontWeight: '600', color: '#10B981', margin: 0 }}>Checked In</p>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.5rem' }}>
                    {formatDate(registration.checkedInAt)}
                  </p>
                </>
              ) : (
                <>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}>
                    <QrCode style={{ width: '2rem', height: '2rem', color: '#94A3B8' }} />
                  </div>
                  <p style={{ fontWeight: '600', color: '#64748B', margin: 0 }}>Not Checked In</p>
                  <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                    Awaiting arrival
                  </p>
                  <button onClick={handleCheckIn} style={{ ...successButtonStyle, marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                    <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                    Check In Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetails;
