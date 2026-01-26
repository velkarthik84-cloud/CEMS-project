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
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Eye,
  Globe,
  Plus,
  Trash2,
  CreditCard
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
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
  const [eventRoles, setEventRoles] = useState([]);

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

        // Load event roles
        if (eventData.eventRoles && Array.isArray(eventData.eventRoles)) {
          setEventRoles(eventData.eventRoles.map(r => ({
            id: r.id || Date.now() + Math.random(),
            roleName: r.roleName || '',
            personName: r.personName || '',
            email: r.email || '',
            phone: r.phone || '',
          })));
        }

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

  // Event Role functions
  const addEventRole = () => {
    const newRole = {
      id: Date.now(),
      roleName: '',
      personName: '',
      email: '',
      phone: '',
    };
    setEventRoles([...eventRoles, newRole]);
  };

  const updateEventRole = (id, field, value) => {
    setEventRoles(eventRoles.map(role =>
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const removeEventRole = (id) => {
    setEventRoles(eventRoles.filter(role => role.id !== id));
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

      // Validate event roles
      const validEventRoles = eventRoles.filter(r => r.roleName && r.personName);

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
        eventRoles: validEventRoles.map(r => ({
          id: r.id.toString(),
          roleName: r.roleName,
          personName: r.personName,
          email: r.email || '',
          phone: r.phone || '',
        })),
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
    <div className="max-w-4xl mx-auto" style={{ width: '100%' }}>
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

        {/* Event Roles */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Event Roles
            </h2>
            <button
              type="button"
              onClick={addEventRole}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>

          {eventRoles.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No roles added yet. Click "Add Role" to assign roles for this event.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {eventRoles.map((role, index) => (
                <div
                  key={role.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-800">
                      Role {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEventRole(role.id)}
                      className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Role Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Coordinator, Organizer"
                        value={role.roleName}
                        onChange={(e) => updateEventRole(role.id, 'roleName', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Person Name *</label>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={role.personName}
                        onChange={(e) => updateEventRole(role.id, 'personName', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={role.email}
                        onChange={(e) => updateEventRole(role.id, 'email', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={role.phone}
                        onChange={(e) => updateEventRole(role.id, 'phone', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
