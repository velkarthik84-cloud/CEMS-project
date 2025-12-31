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
  CreditCard
} from 'lucide-react';
import { doc, getDoc, addDoc, collection, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, uploadFile } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Textarea, Card, FileUpload } from '../../components/common';
import { PageLoader } from '../../components/common/Loading';
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
  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success

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
  }, [eventId]);

  useEffect(() => {
    // Pre-fill form with user data
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
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
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

  const processPayment = async (registrationData) => {
    const res = await loadRazorpay();
    if (!res) {
      toast.error('Failed to load payment gateway');
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',
      amount: event.fee * 100, // Amount in paise
      currency: 'INR',
      name: 'Ventixe Events',
      description: `Registration for ${event.title}`,
      image: '/vite.svg',
      handler: async (response) => {
        try {
          // Update registration with payment details
          await updateDoc(doc(db, 'registrations', registrationData.id), {
            paymentStatus: 'completed',
            paymentId: response.razorpay_payment_id,
            paidAt: serverTimestamp(),
          });

          // Create payment record
          await addDoc(collection(db, 'payments'), {
            registrationId: registrationData.id,
            eventId: event.id,
            userId: user.uid,
            amount: event.fee,
            currency: 'INR',
            status: 'completed',
            razorpayPaymentId: response.razorpay_payment_id,
            createdAt: serverTimestamp(),
          });

          // Update event participant count
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
        name: registrationData.fullName,
        email: registrationData.email,
        contact: registrationData.mobile,
      },
      theme: {
        color: '#1E3A5F',
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const registrationId = generateRegistrationId();

      // Upload ID proof if provided
      let idProofUrl = null;
      if (idProof) {
        idProofUrl = await uploadFile(
          idProof,
          `registrations/${registrationId}/id-proof-${Date.now()}`
        );
      }

      // Create registration document
      const registrationData = {
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

      const docRef = await addDoc(collection(db, 'registrations'), registrationData);
      registrationData.id = docRef.id;

      if (event.fee > 0 && event.mandatoryPayment) {
        // Process payment
        setStep(2);
        await processPayment(registrationData);
      } else {
        // Free event or payment not mandatory
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

  if (loading) {
    return <PageLoader />;
  }

  if (!event) {
    return null;
  }

  // Success Step
  if (step === 3) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center">
            <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Registration Successful!
            </h1>
            <p className="text-text-secondary mb-8">
              You have been registered for {event.title}
            </p>

            {/* QR Code */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 inline-block">
              <QRCodeSVG
                value={`VENTIXE:${eventId}:${user.uid}`}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            <p className="text-sm text-text-secondary mb-6">
              Show this QR code at the venue for entry
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-text-primary mb-3">Event Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="w-4 h-4" />
                  {formatDate(event.eventDate)}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock className="w-4 h-4" />
                  {event.startTime} - {event.endTime}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <MapPin className="w-4 h-4" />
                  {event.type === 'online' ? 'Online Event' : event.venue}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/events')}
              >
                Browse More Events
              </Button>
              <Button
                fullWidth
                onClick={() => window.print()}
              >
                Download Entry Pass
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <h1 className="text-2xl font-bold text-text-primary mb-6">
                Registration Form
              </h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
                      icon={User}
                      required
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email"
                      icon={Mail}
                      required
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Mobile Number"
                      placeholder="Enter 10-digit mobile"
                      icon={Phone}
                      required
                      error={errors.mobile?.message}
                      {...register('mobile')}
                    />
                    <Input
                      label="Organization / College"
                      placeholder="Enter your organization"
                      icon={Building}
                      error={errors.organization?.message}
                      {...register('organization')}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">
                    Additional Information
                  </h2>
                  <div className="space-y-4">
                    <Textarea
                      label="Address"
                      placeholder="Enter your address"
                      rows={3}
                      error={errors.address?.message}
                      {...register('address')}
                    />
                    <Input
                      label="Emergency Contact"
                      placeholder="Emergency contact number"
                      icon={Phone}
                      error={errors.emergencyContact?.message}
                      {...register('emergencyContact')}
                    />
                    <FileUpload
                      label="ID Proof (Optional)"
                      accept="image/*,.pdf"
                      onChange={setIdProof}
                      value={idProof}
                      helperText="Upload Aadhar, PAN, or College ID"
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-secondary">
                      I agree to the terms and conditions. I understand that my registration
                      is subject to availability and the organizer's approval.
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={submitting}
                  icon={event.fee > 0 ? CreditCard : undefined}
                >
                  {event.fee > 0
                    ? `Pay ₹${event.fee} & Register`
                    : 'Complete Registration'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Event Summary */}
          <div>
            <Card className="sticky top-24">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Event Summary
              </h2>

              {event.bannerUrl && (
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="font-semibold text-text-primary mb-3">
                {event.title}
              </h3>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDate(event.eventDate)}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock className="w-4 h-4 text-primary" />
                  {event.startTime} - {event.endTime}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <MapPin className="w-4 h-4 text-primary" />
                  {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary">Registration Fee</span>
                  <span className="font-semibold text-text-primary">
                    {event.fee > 0 ? `₹${event.fee}` : 'Free'}
                  </span>
                </div>
                {event.fee > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-text-secondary">Convenience Fee</span>
                      <span className="text-text-primary">₹0</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="font-semibold text-text-primary">Total</span>
                      <span className="font-bold text-xl text-primary">₹{event.fee}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-2 text-xs text-text-secondary">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Registration is non-refundable. Please ensure all details are correct before submitting.
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegister;
