import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, uploadFile } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Image as ImageIcon,
  Save,
  Eye,
  ArrowLeft
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
import { EVENT_CATEGORIES, EVENT_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  type: z.string().min(1, 'Please select event type'),
  venue: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  eventDate: z.string().min(1, 'Event date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  registrationStart: z.string().min(1, 'Registration start date is required'),
  registrationEnd: z.string().min(1, 'Registration end date is required'),
  maxParticipants: z.string().min(1, 'Maximum participants is required'),
  fee: z.string().optional(),
});

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [isFree, setIsFree] = useState(true);
  const [mandatoryPayment, setMandatoryPayment] = useState(true);
  const [eventType, setEventType] = useState('offline');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: 'offline',
      fee: '0',
    },
  });

  const watchType = watch('type');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Upload banner image
      let bannerUrl = null;
      if (bannerImage) {
        bannerUrl = await uploadFile(
          bannerImage,
          `events/banners/${Date.now()}-${bannerImage.name}`
        );
      }

      // Create event document
      const eventData = {
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
        currentCount: 0,
        fee: isFree ? 0 : parseFloat(data.fee) || 0,
        isFree,
        mandatoryPayment: !isFree && mandatoryPayment,
        status: 'draft',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      toast.success('Event created successfully!');
      navigate(`/admin/events/${docRef.id}/edit`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Create New Event</h1>
          <p className="text-text-secondary">Fill in the details to create a new event</p>
        </div>
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
              {...register('title')}
            />
            <Textarea
              label="Event Description"
              placeholder="Describe your event in detail..."
              rows={5}
              required
              error={errors.description?.message}
              {...register('description')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Event Category"
                options={EVENT_CATEGORIES}
                required
                error={errors.category?.message}
                {...register('category')}
              />
              <Select
                label="Event Type"
                options={EVENT_TYPES}
                required
                error={errors.type?.message}
                {...register('type', {
                  onChange: (e) => setEventType(e.target.value)
                })}
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
              placeholder="https://zoom.us/j/... or Google Meet link"
              helperText="Link will be shared only with registered participants"
              error={errors.meetingLink?.message}
              {...register('meetingLink')}
            />
          ) : (
            <Textarea
              label="Venue Address"
              placeholder="Enter complete venue address"
              rows={3}
              error={errors.venue?.message}
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
              error={errors.eventDate?.message}
              {...register('eventDate')}
            />
            <Input
              label="Start Time"
              type="time"
              required
              error={errors.startTime?.message}
              {...register('startTime')}
            />
            <Input
              label="End Time"
              type="time"
              required
              error={errors.endTime?.message}
              {...register('endTime')}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Registration Opens"
              type="date"
              required
              error={errors.registrationStart?.message}
              {...register('registrationStart')}
            />
            <Input
              label="Registration Closes"
              type="date"
              required
              error={errors.registrationEnd?.message}
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
              placeholder="100"
              required
              error={errors.maxParticipants?.message}
              {...register('maxParticipants')}
            />

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text-primary">Free Event</p>
                <p className="text-sm text-text-secondary">
                  Toggle off to set a registration fee
                </p>
              </div>
              <Toggle
                checked={isFree}
                onChange={setIsFree}
              />
            </div>

            {!isFree && (
              <>
                <Input
                  label="Registration Fee"
                  type="number"
                  placeholder="500"
                  icon={CreditCard}
                  helperText="Amount in INR (₹)"
                  error={errors.fee?.message}
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
            helperText="Recommended size: 1200x600px. Max 5MB."
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={Save}
          >
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
