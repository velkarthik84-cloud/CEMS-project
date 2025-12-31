import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, uploadFile } from '../../services/firebase';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Eye,
  Globe
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  Toggle,
  FileUpload
} from '../../components/common';
import { PageLoader } from '../../components/common/Loading';
import { StatusBadge } from '../../components/common/Badge';
import { EVENT_CATEGORIES, EVENT_TYPES } from '../../utils/constants';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [isFree, setIsFree] = useState(true);
  const [mandatoryPayment, setMandatoryPayment] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const watchType = watch('type');

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        const eventData = { id: eventSnap.id, ...eventSnap.data() };
        setEvent(eventData);

        // Set form values
        setValue('title', eventData.title);
        setValue('description', eventData.description);
        setValue('category', eventData.category);
        setValue('type', eventData.type);
        setValue('venue', eventData.venue || '');
        setValue('meetingLink', eventData.meetingLink || '');
        setValue('eventDate', formatDateForInput(eventData.eventDate));
        setValue('startTime', eventData.startTime);
        setValue('endTime', eventData.endTime);
        setValue('registrationStart', formatDateForInput(eventData.registrationStart));
        setValue('registrationEnd', formatDateForInput(eventData.registrationEnd));
        setValue('maxParticipants', eventData.maxParticipants?.toString());
        setValue('fee', eventData.fee?.toString() || '0');

        setIsFree(eventData.isFree ?? eventData.fee === 0);
        setMandatoryPayment(eventData.mandatoryPayment ?? true);
        if (eventData.bannerUrl) {
          setBannerImage(eventData.bannerUrl);
        }
      } else {
        toast.error('Event not found');
        navigate('/admin/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'yyyy-MM-dd');
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      let bannerUrl = event.bannerUrl;

      // Upload new banner if changed
      if (bannerImage && typeof bannerImage !== 'string') {
        bannerUrl = await uploadFile(
          bannerImage,
          `events/banners/${eventId}-${Date.now()}`
        );
      }

      const updateData = {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        venue: data.type === 'offline' ? data.venue : null,
        meetingLink: data.type === 'online' ? data.meetingLink : null,
        bannerUrl,
        eventDate: new Date(data.eventDate),
        startTime: data.startTime,
        endTime: data.endTime,
        registrationStart: new Date(data.registrationStart),
        registrationEnd: new Date(data.registrationEnd),
        maxParticipants: parseInt(data.maxParticipants),
        fee: isFree ? 0 : parseFloat(data.fee) || 0,
        isFree,
        mandatoryPayment: !isFree && mandatoryPayment,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'events', eventId), updateData);
      toast.success('Event updated successfully!');
      setEvent({ ...event, ...updateData });
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setEvent({ ...event, status: newStatus });
      toast.success(`Event ${newStatus === 'published' ? 'published' : 'status updated'}!`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!event) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/events')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">Edit Event</h1>
              <StatusBadge status={event.status} />
            </div>
            <p className="text-text-secondary">Update event details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/events/${eventId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" icon={Eye}>Preview</Button>
          </a>
          {event.status === 'draft' && (
            <Button
              icon={Globe}
              onClick={() => handleStatusChange('published')}
            >
              Publish
            </Button>
          )}
          {event.status === 'published' && (
            <Button
              variant="secondary"
              onClick={() => handleStatusChange('closed')}
            >
              Close Registration
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {event.currentCount || 0}
              </p>
              <p className="text-sm text-text-secondary">Registrations</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                ₹{((event.currentCount || 0) * (event.fee || 0)).toLocaleString()}
              </p>
              <p className="text-sm text-text-secondary">Revenue</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Users className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {event.maxParticipants - (event.currentCount || 0)}
              </p>
              <p className="text-sm text-text-secondary">Spots Left</p>
            </div>
          </div>
        </Card>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Event Title"
              placeholder="Enter event title"
              required
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />
            <Textarea
              label="Event Description"
              placeholder="Describe your event..."
              rows={5}
              required
              error={errors.description?.message}
              {...register('description', { required: 'Description is required' })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Event Category"
                options={EVENT_CATEGORIES}
                required
                {...register('category')}
              />
              <Select
                label="Event Type"
                options={EVENT_TYPES}
                required
                {...register('type')}
              />
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {watchType === 'online' ? 'Meeting Details' : 'Venue Details'}
          </h2>
          {watchType === 'online' ? (
            <Input
              label="Meeting Link"
              placeholder="https://zoom.us/j/..."
              {...register('meetingLink')}
            />
          ) : (
            <Textarea
              label="Venue Address"
              placeholder="Enter complete venue address"
              rows={3}
              {...register('venue')}
            />
          )}
        </Card>

        {/* Schedule */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Event Date"
              type="date"
              required
              {...register('eventDate')}
            />
            <Input
              label="Start Time"
              type="time"
              required
              {...register('startTime')}
            />
            <Input
              label="End Time"
              type="time"
              required
              {...register('endTime')}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Registration Opens"
              type="date"
              required
              {...register('registrationStart')}
            />
            <Input
              label="Registration Closes"
              type="date"
              required
              {...register('registrationEnd')}
            />
          </div>
        </Card>

        {/* Capacity & Pricing */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Capacity & Pricing
          </h2>
          <div className="space-y-4">
            <Input
              label="Maximum Participants"
              type="number"
              required
              {...register('maxParticipants')}
            />

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text-primary">Free Event</p>
                <p className="text-sm text-text-secondary">
                  Toggle off to set a registration fee
                </p>
              </div>
              <Toggle checked={isFree} onChange={setIsFree} />
            </div>

            {!isFree && (
              <>
                <Input
                  label="Registration Fee"
                  type="number"
                  icon={CreditCard}
                  {...register('fee')}
                />
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">Mandatory Payment</p>
                    <p className="text-sm text-text-secondary">
                      Require payment before confirming registration
                    </p>
                  </div>
                  <Toggle
                    checked={mandatoryPayment}
                    onChange={setMandatoryPayment}
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Banner Image */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Event Banner
          </h2>
          <FileUpload
            label="Upload Banner Image"
            accept="image/*"
            onChange={setBannerImage}
            value={bannerImage}
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/events')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving} icon={Save}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
