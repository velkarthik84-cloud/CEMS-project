import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { db, auth, uploadFile } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Mail,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Save,
  Camera,
  Phone,
  Building,
  Database,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { seedDepartments, sampleDepartments } from '../../utils/seedData';

const Settings = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [notifications, setNotifications] = useState({
    emailRegistrations: true,
    emailPayments: true,
    emailReminders: true,
    browserNotifications: false,
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      displayName: userProfile?.displayName || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      organization: userProfile?.organization || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm();

  const [seeding, setSeeding] = useState(false);
  const [seedResults, setSeedResults] = useState(null);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'developer', label: 'Developer', icon: Database },
  ];

  const handleSeedDepartments = async () => {
    setSeeding(true);
    setSeedResults(null);
    try {
      const results = await seedDepartments();
      setSeedResults(results);
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        toast.success(`Created ${successCount} department(s) successfully!`);
      } else {
        toast.info('All departments already exist');
      }
    } catch (error) {
      console.error('Error seeding:', error);
      toast.error('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const onProfileSubmit = async (data) => {
    setSaving(true);
    try {
      let photoURL = userProfile?.photoURL;

      if (profileImage && typeof profileImage !== 'string') {
        photoURL = await uploadFile(
          profileImage,
          `users/${user.uid}/profile-${Date.now()}`
        );
      }

      await updateUserProfile({
        displayName: data.displayName,
        phone: data.phone,
        organization: data.organization,
        photoURL,
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(auth.currentUser, data.newPassword);
      toast.success('Password updated successfully!');
      resetPassword();
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in to change password');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = async (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        notifications: { ...notifications, [key]: value },
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.875rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#1E293B',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: '0.5rem',
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    backgroundColor: '#E91E63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  };

  const tabStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    backgroundColor: isActive ? '#E91E63' : '#FFFFFF',
    color: isActive ? '#FFFFFF' : '#64748B',
    border: isActive ? 'none' : '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  });

  const toggleStyle = (checked) => ({
    width: '2.75rem',
    height: '1.5rem',
    backgroundColor: checked ? '#E91E63' : '#E2E8F0',
    borderRadius: '1rem',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  });

  const toggleKnobStyle = (checked) => ({
    width: '1.25rem',
    height: '1.25rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    position: 'absolute',
    top: '0.125rem',
    left: checked ? '1.375rem' : '0.125rem',
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '900px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
          Manage your account settings
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={tabStyle(activeTab === tab.id)}
          >
            <tab.icon style={{ width: '1rem', height: '1rem' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', marginBottom: '1.5rem' }}>
            Profile Information
          </h2>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            {/* Profile Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {(profileImage || userProfile?.photoURL) ? (
                    <img
                      src={typeof profileImage === 'string'
                        ? profileImage
                        : profileImage
                          ? URL.createObjectURL(profileImage)
                          : userProfile?.photoURL
                      }
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '1.75rem', color: '#FFFFFF', fontWeight: '600' }}>
                      {userProfile?.displayName?.[0]?.toUpperCase() || 'A'}
                    </span>
                  )}
                </div>
                <label style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '1.75rem',
                  height: '1.75rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <Camera style={{ width: '0.875rem', height: '0.875rem', color: '#64748B' }} />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => setProfileImage(e.target.files?.[0])}
                  />
                </label>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                  {userProfile?.displayName || 'Admin'}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0.25rem 0 0' }}>{userProfile?.email}</p>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0.25rem 0 0' }}>
                  Role: {userProfile?.role || 'admin'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                    {...registerProfile('displayName', { required: 'Name is required' })}
                  />
                </div>
                {profileErrors.displayName && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>{profileErrors.displayName.message}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    disabled
                    style={{ ...inputStyle, paddingLeft: '2.5rem', opacity: 0.6, cursor: 'not-allowed' }}
                    {...registerProfile('email')}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                    {...registerProfile('phone')}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Organization</label>
                <div style={{ position: 'relative' }}>
                  <Building style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Enter organization name"
                    style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                    {...registerProfile('organization')}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={saving} style={{ ...buttonStyle, opacity: saving ? 0.7 : 1 }}>
                <Save style={{ width: '1rem', height: '1rem' }} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', marginBottom: '1.5rem' }}>
            Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
                  <input
                    type="password"
                    placeholder="Enter current password"
                    style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
                  <input
                    type="password"
                    placeholder="Enter new password"
                    style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                    {...registerPassword('confirmPassword', { required: 'Please confirm password' })}
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} style={{ ...buttonStyle, opacity: saving ? 0.7 : 1 }}>
              <Shield style={{ width: '1rem', height: '1rem' }} />
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginBottom: '0.5rem' }}>Two-Factor Authentication</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
              Add an extra layer of security to your account
            </p>
            <button style={{ ...buttonStyle, backgroundColor: '#FFFFFF', color: '#64748B', border: '1px solid #E2E8F0', opacity: 0.6, cursor: 'not-allowed' }} disabled>
              Enable 2FA (Coming Soon)
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', marginBottom: '1.5rem' }}>
            Notification Preferences
          </h2>

          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>Email Notifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { key: 'emailRegistrations', title: 'New Registrations', desc: 'Get notified when someone registers for your event' },
                { key: 'emailPayments', title: 'Payment Received', desc: 'Get notified when a payment is completed' },
                { key: 'emailReminders', title: 'Event Reminders', desc: 'Receive reminders before your events' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>{item.title}</p>
                    <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0' }}>{item.desc}</p>
                  </div>
                  <div
                    style={toggleStyle(notifications[item.key])}
                    onClick={() => handleNotificationChange(item.key, !notifications[item.key])}
                  >
                    <div style={toggleKnobStyle(notifications[item.key])} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>Browser Notifications</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>Push Notifications</p>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0' }}>Receive notifications in your browser</p>
              </div>
              <div
                style={toggleStyle(notifications.browserNotifications)}
                onClick={() => handleNotificationChange('browserNotifications', !notifications.browserNotifications)}
              >
                <div style={toggleKnobStyle(notifications.browserNotifications)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', marginBottom: '1.5rem' }}>
            Payment Settings
          </h2>

          <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem' }}>Razorpay Integration</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1rem' }}>
              Your Razorpay account is connected and ready to accept payments.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '0.625rem', height: '0.625rem', backgroundColor: '#10B981', borderRadius: '50%' }} />
              <span style={{ fontSize: '0.875rem', color: '#10B981', fontWeight: '500' }}>Connected</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>Payment Methods Accepted</h3>
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '0.75rem' }}>
              {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => (
                <div
                  key={method}
                  style={{
                    padding: '0.875rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#64748B',
                  }}
                >
                  {method}
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', marginBottom: '0.5rem' }}>Bank Account</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
              Payments are settled to your linked Razorpay account
            </p>
            <button style={{ ...buttonStyle, backgroundColor: '#FFFFFF', color: '#64748B', border: '1px solid #E2E8F0', opacity: 0.6, cursor: 'not-allowed' }} disabled>
              Manage in Razorpay Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Developer Tab */}
      {activeTab === 'developer' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', marginBottom: '1.5rem' }}>
            Developer Tools
          </h2>

          {/* Seed Departments */}
          <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem' }}>
              Seed Test Departments
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1rem' }}>
              Create sample department accounts for testing. This will create 5 departments with predefined credentials.
            </p>

            {/* Sample Departments Preview */}
            <div style={{ marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left', color: '#64748B', fontWeight: '500' }}>Department</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', color: '#64748B', fontWeight: '500' }}>Username</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', color: '#64748B', fontWeight: '500' }}>Password</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleDepartments.map((dept, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.5rem', color: '#1E293B' }}>{dept.code}</td>
                      <td style={{ padding: '0.5rem', color: '#1E293B', fontFamily: 'monospace' }}>{dept.username}</td>
                      <td style={{ padding: '0.5rem', color: '#1E293B', fontFamily: 'monospace' }}>{dept.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSeedDepartments}
              disabled={seeding}
              style={{
                ...buttonStyle,
                backgroundColor: seeding ? '#94A3B8' : '#1E3A5F',
                opacity: seeding ? 0.7 : 1,
                cursor: seeding ? 'not-allowed' : 'pointer',
              }}
            >
              <Database style={{ width: '1rem', height: '1rem' }} />
              {seeding ? 'Creating...' : 'Create Test Departments'}
            </button>

            {/* Results */}
            {seedResults && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem' }}>Results:</p>
                {seedResults.map((result, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    {result.success ? (
                      <CheckCircle style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} />
                    ) : (
                      <AlertCircle style={{ width: '0.875rem', height: '0.875rem', color: '#F59E0B' }} />
                    )}
                    <span style={{ fontSize: '0.8125rem', color: result.success ? '#10B981' : '#F59E0B' }}>
                      {result.department}: {result.success ? 'Created' : result.reason}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Login URLs */}
          <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '0.75rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.5rem' }}>
              Login URLs
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1rem' }}>
              Quick access to different panel login pages
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Admin Login', url: '/login' },
                { label: 'Department Login', url: '/department/login' },
                { label: 'Judge Login', url: '/judge/login' },
              ].map((item) => (
                <div key={item.url} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#FFFFFF', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.875rem', color: '#1E293B' }}>{item.label}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8125rem', color: '#E91E63', textDecoration: 'none', fontFamily: 'monospace' }}
                  >
                    {item.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
