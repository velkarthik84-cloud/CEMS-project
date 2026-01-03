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
  X,
  UserCheck,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { EventQRModal } from '../../components/common';
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
  const [qrModal, setQrModal] = useState({ open: false, eventId: null, eventTitle: '' });

  // Judges state
  const [judges, setJudges] = useState([]);
  const [showPassword, setShowPassword] = useState({});

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

  const handleQrModalClose = () => {
    setQrModal({ open: false, eventId: null, eventTitle: '' });
    navigate('/admin/events');
  };

  // Judge functions
  const addJudge = () => {
    const newJudge = {
      id: Date.now(),
      name: '',
      username: '',
      password: '',
      email: '',
    };
    setJudges([...judges, newJudge]);
  };

  const updateJudge = (id, field, value) => {
    setJudges(judges.map(judge =>
      judge.id === id ? { ...judge, [field]: value } : judge
    ));
  };

  const removeJudge = (id) => {
    setJudges(judges.filter(judge => judge.id !== id));
  };

  const generatePassword = (id) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateJudge(id, 'password', password);
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let bannerUrl = null;
      if (bannerImage) {
        bannerUrl = await uploadFile(bannerImage, `events/banners/${Date.now()}-${bannerImage.name}`);
      }

      // Validate judges
      const validJudges = judges.filter(j => j.name && j.username && j.password);

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
        judges: validJudges.map(j => ({
          id: j.id.toString(),
          name: j.name,
          username: j.username,
          password: j.password,
          email: j.email || '',
        })),
        status: 'draft',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      toast.success('Event created successfully!');
      setQrModal({ open: true, eventId: docRef.id, eventTitle: data.title });
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.875rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  const sectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1E293B',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: '0.875rem',
    color: '#1E293B',
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
    appearance: 'none',
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
    width: '2.75rem',
    height: '1.5rem',
    borderRadius: '9999px',
    backgroundColor: active ? '#E91E63' : '#CBD5E1',
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

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#E91E63',
    color: '#FFFFFF',
  };

  const outlineButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#FFFFFF',
    color: '#64748B',
    border: '1px solid #E2E8F0',
  };

  const judgeCardStyle = {
    padding: '1.25rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #E2E8F0',
  };

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.5rem',
            borderRadius: '0.5rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>Create New Event</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>Fill in the details to create a new event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Basic Information */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
            Basic Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem' }}>
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
            <MapPin style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
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
            <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
            Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1rem' }}>
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
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem', marginTop: '1rem' }}>
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
            <Users style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
            Capacity & Pricing
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <p style={{ fontWeight: '500', color: '#1E293B', margin: 0 }}>Free Event</p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0' }}>
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
                </div>
                <div style={toggleBoxStyle}>
                  <div>
                    <p style={{ fontWeight: '500', color: '#1E293B', margin: 0 }}>Mandatory Payment</p>
                    <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0' }}>
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

        {/* Judges Section */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ ...sectionTitleStyle, marginBottom: 0 }}>
              <UserCheck style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
              Event Judges
            </h2>
            <button
              type="button"
              onClick={addJudge}
              style={{
                ...outlineButtonStyle,
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
              }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Add Judge
            </button>
          </div>

          {judges.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: '0.75rem',
              border: '2px dashed #E2E8F0',
            }}>
              <UserCheck style={{ width: '2.5rem', height: '2.5rem', color: '#CBD5E1', margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                No judges added yet. Click "Add Judge" to add judges for this event.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                Judges can login to score participants using their credentials.
              </p>
            </div>
          ) : (
            <div>
              {judges.map((judge, index) => (
                <div key={judge.id} style={judgeCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B' }}>
                      Judge {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeJudge(judge.id)}
                      style={{
                        padding: '0.375rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 style={{ width: '1rem', height: '1rem', color: '#EF4444' }} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem' }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.8125rem' }}>Judge Name *</label>
                      <input
                        type="text"
                        placeholder="Enter judge name"
                        value={judge.name}
                        onChange={(e) => updateJudge(judge.id, 'name', e.target.value)}
                        style={{ ...inputStyle, backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.8125rem' }}>Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="judge@email.com"
                        value={judge.email}
                        onChange={(e) => updateJudge(judge.id, 'email', e.target.value)}
                        style={{ ...inputStyle, backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.8125rem' }}>Username *</label>
                      <input
                        type="text"
                        placeholder="judge_username"
                        value={judge.username}
                        onChange={(e) => updateJudge(judge.id, 'username', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                        style={{ ...inputStyle, backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.8125rem' }}>Password *</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type={showPassword[judge.id] ? 'text' : 'password'}
                            placeholder="Enter password"
                            value={judge.password}
                            onChange={(e) => updateJudge(judge.id, 'password', e.target.value)}
                            style={{ ...inputStyle, backgroundColor: '#FFFFFF', paddingRight: '2.5rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(judge.id)}
                            style={{
                              position: 'absolute',
                              right: '0.75rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            {showPassword[judge.id] ? (
                              <EyeOff style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                            ) : (
                              <Eye style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                            )}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => generatePassword(judge.id)}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: '#E91E63',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banner Image */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <ImageIcon style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
            Event Banner
          </h2>
          {bannerPreview ? (
            <div style={{ position: 'relative', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <img src={bannerPreview} alt="Banner preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => { setBannerImage(null); setBannerPreview(null); }}
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
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
            <label style={{
              display: 'block',
              border: '2px dashed #E2E8F0',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#FAFBFC',
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <Upload style={{ width: '2.5rem', height: '2.5rem', color: '#94A3B8', margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: '500', color: '#1E293B', margin: 0 }}>Click to upload banner image</p>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem' }}>Recommended size: 1200x600px. Max 5MB.</p>
            </label>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', paddingTop: '0.5rem' }}>
          <button type="button" onClick={() => navigate(-1)} style={outlineButtonStyle}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, opacity: loading ? 0.7 : 1 }}>
            <Save style={{ width: '1rem', height: '1rem' }} />
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>

      {/* QR Code Modal */}
      <EventQRModal
        isOpen={qrModal.open}
        onClose={handleQrModalClose}
        eventId={qrModal.eventId}
        eventTitle={qrModal.eventTitle}
      />
    </div>
  );
};

export default CreateEvent;
