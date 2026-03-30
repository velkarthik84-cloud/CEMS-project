import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { updatePassword } from 'firebase/auth';
import { auth, uploadFile } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Mail,
  Lock,
  Shield,
  Save,
  Camera,
  Phone,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

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
    reset: resetPassword,
  } = useForm();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '900px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
          Settings
        </h1>
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
                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                  {userProfile?.email}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0.25rem 0 0' }}>
                  Role: {userProfile?.role || 'admin'}
                </p>
              </div>
            </div>

            {/* Fields */}
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
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>
                    {profileErrors.displayName.message}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#94A3B8' }} />
                  <input
                    type="email"
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

            {/* Save */}
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
        </div>
      )}

    </div>
  );
};

export default Settings;
