import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  CheckCircle
} from 'lucide-react';
import { Button, Card } from '../../components/common';
import { StatusBadge } from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loading';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ParticipantDetails = () => {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [participantId]);

  const fetchData = async () => {
    try {
      // Fetch registration
      const regRef = doc(db, 'registrations', participantId);
      const regSnap = await getDoc(regRef);

      if (regSnap.exists()) {
        const regData = { id: regSnap.id, ...regSnap.data() };
        setRegistration(regData);

        // Fetch event details
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
    return format(date, 'MMMM dd, yyyy HH:mm');
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

  if (loading) {
    return <PageLoader />;
  }

  if (!registration) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/participants')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Participant Details
          </h1>
          <p className="text-text-secondary">
            Registration ID: {registration.registrationId}
          </p>
        </div>
        {registration.attendanceStatus !== 'checked_in' && (
          <Button icon={CheckCircle} onClick={handleCheckIn}>
            Mark Check-in
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Full Name</p>
                  <p className="font-medium text-text-primary">
                    {registration.fullName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Email</p>
                  <p className="font-medium text-text-primary">
                    {registration.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Mobile</p>
                  <p className="font-medium text-text-primary">
                    {registration.mobile}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Organization</p>
                  <p className="font-medium text-text-primary">
                    {registration.organization || '-'}
                  </p>
                </div>
              </div>
              {registration.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">Address</p>
                    <p className="font-medium text-text-primary">
                      {registration.address}
                    </p>
                  </div>
                </div>
              )}
              {registration.emergencyContact && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">Emergency Contact</p>
                    <p className="font-medium text-text-primary">
                      {registration.emergencyContact}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Event Information */}
          {event && (
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Event Information
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  {event.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{event.title}</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {formatDate(event.eventDate)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {event.startTime} - {event.endTime}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {event.type === 'online' ? 'Online Event' : event.venue}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Information */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Payment Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Status</span>
                <StatusBadge status={registration.paymentStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Amount</span>
                <span className="font-semibold text-text-primary">
                  {registration.amount > 0 ? `₹${registration.amount}` : 'Free'}
                </span>
              </div>
              {registration.paymentId && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Payment ID</span>
                  <span className="font-mono text-sm text-text-primary">
                    {registration.paymentId}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Registered On</span>
                <span className="text-text-primary">
                  {formatDate(registration.createdAt)}
                </span>
              </div>
            </div>
          </Card>

          {/* ID Proof */}
          {registration.idProofUrl && (
            <Card>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                ID Proof
              </h2>
              <a
                href={registration.idProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Download className="w-4 h-4" />
                View/Download ID Proof
              </a>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card className="text-center">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Entry QR Code
            </h2>
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG
                value={`VENTIXE:${registration.eventId}:${registration.registrationId}`}
                size={180}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-sm text-text-secondary mt-3">
              Scan for check-in
            </p>
          </Card>

          {/* Attendance Status */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Attendance Status
            </h2>
            <div className="text-center py-4">
              {registration.attendanceStatus === 'checked_in' ? (
                <>
                  <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <p className="font-semibold text-success">Checked In</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {formatDate(registration.checkedInAt)}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <QrCode className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-semibold text-text-secondary">Not Checked In</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Awaiting arrival
                  </p>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetails;
