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
  ArrowLeft,
  Upload,
  X
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
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
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isFree, setIsFree] = useState(true);
  const [mandatoryPayment, setMandatoryPayment] = useState(true);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let bannerUrl = null;
      if (bannerImage) {
        bannerUrl = await uploadFile(bannerImage, `events/banners/${Date.now()}-${bannerImage.name}`);
      }

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

  // Styles
  const containerStyle = { maxWidth: '56rem', margin: '0 auto' };
  const headerStyle = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' };
  const backBtnStyle = {
    padding: '0.5rem',
    borderRadius: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };
  const titleStyle = { fontSize: '1.5rem', fontWeight: 'bold', color: '#1E3A5F' };
  const subtitleStyle = { color: '#64748B', fontSize: '0.875rem' };
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const sectionTitleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1E3A5F',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: '0.875rem',
    outline: 'none',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const errorStyle = {
    color: '#EF4444',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  };

  const toggleBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '0.5rem',
  };

  const toggleBtnStyle = (active) => ({
    width: '3rem',
    height: '1.5rem',
    borderRadius: '9999px',
    backgroundColor: active ? '#1E3A5F' : '#CBD5E1',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s ease',
  });

  const toggleKnobStyle = (active) => ({
    position: 'absolute',
    top: '2px',
    left: active ? 'calc(100% - 1.25rem - 2px)' : '2px',
    width: '1.25rem',
    height: '1.25rem',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  });

  const uploadAreaStyle = {
    border: '2px dashed #E2E8F0',
    borderRadius: '0.75rem',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FAFBFC',
  };

  const previewStyle = {
    position: 'relative',
    borderRadius: '0.75rem',
    overflow: 'hidden',
  };

  const actionsStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '1rem',
    paddingTop: '1rem',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button style={backBtnStyle} onClick={() => navigate(-1)}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft style={{ width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
        </button>
        <div>
          <h1 style={titleStyle}>Create New Event</h1>
          <p style={subtitleStyle}>Fill in the details to create a new event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
        {/* Basic Information */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#1E3A5F' }} />
            Basic Information
          </h2>
          <div style={inputGroupStyle}>
            <div>
              <label style={labelStyle}>Event Title *</label>
              <input
                type="text"
                placeholder="Enter event title"
                style={inputStyle}
                {...register('title')}
              />
              {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Event Description *</label>
              <textarea
                placeholder="Describe your event in detail..."
                style={textareaStyle}
                {...register('description')}
              />
              {errors.description && <p style={errorStyle}>{errors.description.message}</p>}
            </div>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Event Category *</label>
                <select style={selectStyle} {...register('category')}>
                  <option value="">Select Category</option>
                  {EVENT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p style={errorStyle}>{errors.category.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Event Type *</label>
                <select style={selectStyle} {...register('type')}>
                  {EVENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.type && <p style={errorStyle}>{errors.type.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <MapPin style={{ width: '1.25rem', height: '1.25rem', color: '#1E3A5F' }} />
            {watchType === 'online' ? 'Meeting Details' : 'Venue Details'}
          </h2>
          {watchType === 'online' ? (
            <div>
              <label style={labelStyle}>Meeting Link</label>
              <input
                type="url"
                placeholder="https://zoom.us/j/... or Google Meet link"
                style={inputStyle}
                {...register('meetingLink')}
              />
              <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                Link will be shared only with registered participants
              </p>
              {errors.meetingLink && <p style={errorStyle}>{errors.meetingLink.message}</p>}
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Venue Address</label>
              <textarea
                placeholder="Enter complete venue address"
                style={{ ...textareaStyle, minHeight: '80px' }}
                {...register('venue')}
              />
              {errors.venue && <p style={errorStyle}>{errors.venue.message}</p>}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#1E3A5F' }} />
            Schedule
          </h2>
          <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div>
              <label style={labelStyle}>Event Date *</label>
              <input type="date" style={inputStyle} {...register('eventDate')} />
              {errors.eventDate && <p style={errorStyle}>{errors.eventDate.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Start Time *</label>
              <input type="time" style={inputStyle} {...register('startTime')} />
              {errors.startTime && <p style={errorStyle}>{errors.startTime.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>End Time *</label>
              <input type="time" style={inputStyle} {...register('endTime')} />
              {errors.endTime && <p style={errorStyle}>{errors.endTime.message}</p>}
            </div>
          </div>
          <div style={{ ...gridStyle, marginTop: '1rem' }}>
            <div>
              <label style={labelStyle}>Registration Opens *</label>
              <input type="date" style={inputStyle} {...register('registrationStart')} />
              {errors.registrationStart && <p style={errorStyle}>{errors.registrationStart.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Registration Closes *</label>
              <input type="date" style={inputStyle} {...register('registrationEnd')} />
              {errors.registrationEnd && <p style={errorStyle}>{errors.registrationEnd.message}</p>}
            </div>
          </div>
        </div>

        {/* Capacity & Pricing */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Users style={{ width: '1.25rem', height: '1.25rem', color: '#1E3A5F' }} />
            Capacity & Pricing
          </h2>
          <div style={inputGroupStyle}>
            <div>
              <label style={labelStyle}>Maximum Participants *</label>
              <input
                type="number"
                placeholder="100"
                style={inputStyle}
                {...register('maxParticipants')}
              />
              {errors.maxParticipants && <p style={errorStyle}>{errors.maxParticipants.message}</p>}
            </div>

            <div style={toggleBoxStyle}>
              <div>
                <p style={{ fontWeight: '500', color: '#1E3A5F' }}>Free Event</p>
                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                  Toggle off to set a registration fee
                </p>
              </div>
              <button type="button" style={toggleBtnStyle(isFree)} onClick={() => setIsFree(!isFree)}>
                <span style={toggleKnobStyle(isFree)} />
              </button>
            </div>

            {!isFree && (
              <>
                <div>
                  <label style={labelStyle}>Registration Fee (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
                    <input
                      type="number"
                      placeholder="500"
                      style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                      {...register('fee')}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>Amount in INR</p>
                </div>
                <div style={toggleBoxStyle}>
                  <div>
                    <p style={{ fontWeight: '500', color: '#1E3A5F' }}>Mandatory Payment</p>
                    <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                      Require payment before confirming registration
                    </p>
                  </div>
                  <button type="button" style={toggleBtnStyle(mandatoryPayment)} onClick={() => setMandatoryPayment(!mandatoryPayment)}>
                    <span style={toggleKnobStyle(mandatoryPayment)} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Banner Image */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <ImageIcon style={{ width: '1.25rem', height: '1.25rem', color: '#1E3A5F' }} />
            Event Banner
          </h2>
          {bannerPreview ? (
            <div style={previewStyle}>
              <img src={bannerPreview} alt="Banner preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => { setBannerImage(null); setBannerPreview(null); }}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          ) : (
            <label style={uploadAreaStyle}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <Upload style={{ width: '2.5rem', height: '2.5rem', color: '#64748B', margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: '500', color: '#1E3A5F' }}>Click to upload banner image</p>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Recommended size: 1200x600px. Max 5MB.</p>
            </label>
          )}
        </div>

        {/* Actions */}
        <div style={actionsStyle}>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={Save}>
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
