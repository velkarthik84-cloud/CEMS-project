import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Building,
  AlertCircle,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Upload,
  X,
  FileText
} from 'lucide-react';
import { doc, getDoc, addDoc, collection, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, uploadFile } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const registrationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  organization: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

const EventRegister = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [idProof, setIdProof] = useState(null);
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    resolver: zodResolver(registrationSchema),
  });

  useEffect(() => {
    fetchEvent();
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [eventId]);

  useEffect(() => {
    if (userProfile) {
      setValue('fullName', userProfile.displayName || '');
      setValue('email', userProfile.email || '');
    }
  }, [userProfile, setValue]);

  const fetchEvent = async () => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        setEvent({ id: eventSnap.id, ...eventSnap.data() });
      } else {
        toast.error('Event not found');
        navigate('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return '-';
    }
  };

  const generateRegistrationId = () => {
    const prefix = 'REG';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async (regData) => {
    const res = await loadRazorpay();
    if (!res) {
      toast.error('Failed to load payment gateway');
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: event.fee * 100,
      currency: 'INR',
      name: 'Ventixe Events',
      description: `Registration for ${event.title}`,
      handler: async (response) => {
        try {
          await updateDoc(doc(db, 'registrations', regData.id), {
            paymentStatus: 'completed',
            paymentId: response.razorpay_payment_id,
            paidAt: serverTimestamp(),
          });

          await addDoc(collection(db, 'payments'), {
            registrationId: regData.id,
            eventId: event.id,
            userId: user.uid,
            amount: event.fee,
            currency: 'INR',
            status: 'completed',
            razorpayPaymentId: response.razorpay_payment_id,
            createdAt: serverTimestamp(),
          });

          await updateDoc(doc(db, 'events', event.id), {
            currentCount: increment(1),
          });

          toast.success('Payment successful!');
          setStep(3);
        } catch (error) {
          console.error('Error updating payment:', error);
          toast.error('Payment recorded but confirmation failed. Contact support.');
        }
      },
      prefill: {
        name: regData.fullName,
        email: regData.email,
        contact: regData.mobile,
      },
      theme: {
        color: '#1E3A5F',
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const onSubmit = async (data) => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setSubmitting(true);
    try {
      const registrationId = generateRegistrationId();

      let idProofUrl = null;
      if (idProof) {
        idProofUrl = await uploadFile(
          idProof,
          `registrations/${registrationId}/id-proof-${Date.now()}`
        );
      }

      const regData = {
        registrationId,
        eventId: event.id,
        eventTitle: event.title,
        userId: user.uid,
        ...data,
        idProofUrl,
        paymentStatus: event.fee > 0 ? 'pending' : 'completed',
        paymentId: null,
        amount: event.fee,
        attendanceStatus: 'not_checked_in',
        checkedInAt: null,
        qrCode: registrationId,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'registrations'), regData);
      regData.id = docRef.id;
      setRegistrationData(regData);

      if (event.fee > 0 && event.mandatoryPayment) {
        setStep(2);
        await processPayment(regData);
      } else {
        await updateDoc(doc(db, 'events', event.id), {
          currentCount: increment(1),
        });
        toast.success('Registration successful!');
        setStep(3);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setIdProof(file);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #F1F5F9',
            borderTopColor: '#E91E63',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ color: '#64748B', margin: 0 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  // Success Step
  if (step === 3) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <CheckCircle style={{ width: '2rem', height: '2rem', color: '#FFFFFF' }} />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem' }}>
            Registration Successful!
          </h1>
          <p style={{ color: '#64748B', margin: '0 0 0.25rem', fontSize: '0.9375rem' }}>
            You have been registered for
          </p>
          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1E3A5F', margin: '0 0 1.5rem' }}>
            {event.title}
          </p>

          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            display: 'inline-block',
            marginBottom: '1rem',
          }}>
            <QRCodeSVG
              value={`VENTIXE:${eventId}:${user?.uid || 'guest'}`}
              size={160}
              level="H"
              includeMargin
            />
          </div>

          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 1.25rem' }}>
            Show this QR code at the venue for entry
          </p>

          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '0.75rem',
            padding: '1rem',
            textAlign: 'left',
            marginBottom: '1.25rem',
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.75rem' }}>
              Event Details
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.5rem' }}>
              <Calendar style={{ width: '0.875rem', height: '0.875rem', color: '#E91E63' }} />
              {formatDate(event.eventDate)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.5rem' }}>
              <Clock style={{ width: '0.875rem', height: '0.875rem', color: '#E91E63' }} />
              {event.startTime} - {event.endTime}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
              <MapPin style={{ width: '0.875rem', height: '0.875rem', color: '#E91E63' }} />
              {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/events')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                border: '1px solid #E2E8F0',
                borderRadius: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Browse Events
            </button>
            <button
              onClick={() => window.print()}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#E91E63',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Download Pass
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Input Component
  const InputField = ({ icon: Icon, label, required, error, ...props }) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '500', color: '#1E293B' }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1rem',
            height: '1rem',
            color: '#94A3B8',
          }} />
        )}
        <input
          {...props}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            paddingLeft: Icon ? '2.5rem' : '0.875rem',
            backgroundColor: '#F8FAFC',
            border: `1px solid ${error ? '#EF4444' : '#E2E8F0'}`,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#1E293B',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>
      {error && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '1rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.5rem 0.875rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '0.5rem',
            color: '#64748B',
            fontSize: '0.8125rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          <ArrowLeft style={{ width: '0.875rem', height: '0.875rem' }} />
          Back
        </button>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '1.25rem',
        }}>
          {/* Form Section */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E293B', margin: '0 0 1.25rem' }}>
                Registration Form
              </h1>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Personal Information */}
                <h2 style={{
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1E293B',
                  margin: '0 0 0.875rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #F1F5F9',
                }}>
                  Personal Information
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '0.75rem',
                }}>
                  <InputField
                    icon={User}
                    label="Full Name"
                    required
                    placeholder="Enter your full name"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />
                  <InputField
                    icon={Mail}
                    label="Email Address"
                    required
                    type="email"
                    placeholder="Enter your email"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <InputField
                    icon={Phone}
                    label="Mobile Number"
                    required
                    type="tel"
                    placeholder="Enter 10-digit mobile"
                    error={errors.mobile?.message}
                    {...register('mobile')}
                  />
                  <InputField
                    icon={Building}
                    label="Organization / College"
                    placeholder="Enter your organization"
                    {...register('organization')}
                  />
                </div>

                {/* Additional Information */}
                <h2 style={{
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1E293B',
                  margin: '1.25rem 0 0.875rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #F1F5F9',
                }}>
                  Additional Information
                </h2>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '500', color: '#1E293B' }}>
                    Address
                  </label>
                  <textarea
                    placeholder="Enter your address"
                    {...register('address')}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#1E293B',
                      outline: 'none',
                      boxSizing: 'border-box',
                      minHeight: '70px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <InputField
                  icon={Phone}
                  label="Emergency Contact"
                  type="tel"
                  placeholder="Emergency contact number"
                  {...register('emergencyContact')}
                />

                {/* File Upload */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: '500', color: '#1E293B' }}>
                    ID Proof (Optional)
                  </label>
                  {!idProof ? (
                    <label style={{
                      display: 'block',
                      border: '2px dashed #E2E8F0',
                      borderRadius: '0.5rem',
                      padding: '1.25rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#FAFBFC',
                    }}>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <Upload style={{ width: '1.5rem', height: '1.5rem', color: '#94A3B8', margin: '0 auto 0.375rem' }} />
                      <p style={{ margin: '0 0 0.125rem', color: '#1E293B', fontWeight: '500', fontSize: '0.8125rem' }}>
                        Click to upload
                      </p>
                      <p style={{ margin: 0, fontSize: '0.6875rem', color: '#94A3B8' }}>
                        Aadhar, PAN, or College ID (Max 5MB)
                      </p>
                    </label>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      backgroundColor: '#F0FDF4',
                      borderRadius: '0.5rem',
                      border: '1px solid #BBF7D0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText style={{ width: '1rem', height: '1rem', color: '#10B981' }} />
                        <span style={{ fontSize: '0.8125rem', color: '#1E293B' }}>{idProof.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIdProof(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        <X style={{ width: '0.875rem', height: '0.875rem', color: '#EF4444' }} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '0.5rem',
                  padding: '0.875rem',
                  marginBottom: '1rem',
                }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      style={{ width: '1rem', height: '1rem', marginTop: '0.125rem', accentColor: '#E91E63' }}
                    />
                    <span style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.5 }}>
                      I agree to the terms and conditions. I understand that my registration
                      is subject to availability and the organizer's approval.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem',
                    backgroundColor: '#E91E63',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.625rem',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {event.fee > 0 && event.mandatoryPayment && <CreditCard style={{ width: '1.125rem', height: '1.125rem' }} />}
                  {submitting ? 'Processing...' : (
                    event.isFree || event.fee === 0
                      ? 'Complete Registration'
                      : event.mandatoryPayment
                        ? `Pay ₹${event.fee} & Register`
                        : 'Register Now (Pay at Venue)'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Event Summary Sidebar */}
          <div style={{ width: isMobile ? '100%' : '300px', flexShrink: 0 }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              position: isMobile ? 'relative' : 'sticky',
              top: '1rem',
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 1rem' }}>
                Event Summary
              </h2>

              {event.bannerUrl && (
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  style={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '0.5rem',
                    marginBottom: '0.875rem',
                  }}
                />
              )}

              <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.875rem' }}>
                {event.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <Calendar style={{ width: '0.875rem', height: '0.875rem', color: '#E91E63' }} />
                {formatDate(event.eventDate)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <Clock style={{ width: '0.875rem', height: '0.875rem', color: '#E91E63' }} />
                {event.startTime} - {event.endTime}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B', marginBottom: '1rem' }}>
                <MapPin style={{ width: '0.875rem', height: '0.875rem', color: '#E91E63' }} />
                {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <span style={{ color: '#64748B', fontSize: '0.8125rem' }}>Registration Fee</span>
                  <span style={{ fontWeight: '600', color: event.isFree || event.fee === 0 ? '#10B981' : '#1E293B', fontSize: '0.875rem' }}>
                    {event.isFree || event.fee === 0 ? 'FREE' : `₹${event.fee}`}
                  </span>
                </div>

                {event.fee > 0 && !event.isFree && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Payment Mode</span>
                      <span style={{
                        color: event.mandatoryPayment ? '#E91E63' : '#10B981',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {event.mandatoryPayment ? 'Pay Now' : 'Pay at Venue'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.625rem',
                      borderTop: '1px solid #E2E8F0',
                    }}>
                      <span style={{ fontWeight: '600', color: '#1E293B', fontSize: '0.875rem' }}>Total</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#E91E63' }}>
                        ₹{event.fee}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.375rem',
                marginTop: '0.875rem',
                padding: '0.625rem',
                backgroundColor: '#FEF3C7',
                borderRadius: '0.375rem',
                fontSize: '0.6875rem',
                color: '#92400E',
              }}>
                <AlertCircle style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0, marginTop: '1px' }} />
                <span>Registration is non-refundable. Please ensure all details are correct.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EventRegister;
