import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updatePassword, updateEmail } from 'firebase/auth';
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
  Camera
} from 'lucide-react';
import { Button, Input, Card, Toggle, FileUpload } from '../../components/common';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Notification settings
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
    watch,
  } = useForm();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment', icon: CreditCard },
  ];

  const onProfileSubmit = async (data) => {
    setSaving(true);
    try {
      let photoURL = userProfile?.photoURL;

      // Upload profile image if changed
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
    // Save to Firestore
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        notifications: { ...notifications, [key]: value },
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" style={{ width: '100%' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary">Manage your account settings</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white text-text-secondary hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Profile Information
          </h2>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                  {(profileImage || userProfile?.photoURL) ? (
                    <img
                      src={typeof profileImage === 'string'
                        ? profileImage
                        : profileImage
                          ? URL.createObjectURL(profileImage)
                          : userProfile?.photoURL
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-white font-bold">
                      {userProfile?.displayName?.[0]?.toUpperCase() || 'A'}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50">
                  <Camera className="w-4 h-4 text-text-secondary" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setProfileImage(e.target.files?.[0])}
                  />
                </label>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {userProfile?.displayName || 'Admin'}
                </h3>
                <p className="text-sm text-text-secondary">{userProfile?.email}</p>
                <p className="text-xs text-text-secondary mt-1">
                  Role: {userProfile?.role || 'admin'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Enter your name"
                icon={User}
                error={profileErrors.displayName?.message}
                {...registerProfile('displayName', { required: 'Name is required' })}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                icon={Mail}
                disabled
                {...registerProfile('email')}
              />
              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                {...registerProfile('phone')}
              />
              <Input
                label="Organization"
                placeholder="Enter organization name"
                {...registerProfile('organization')}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={saving} icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              icon={Lock}
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword', { required: 'Current password is required' })}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              icon={Lock}
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              icon={Lock}
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword('confirmPassword', { required: 'Please confirm password' })}
            />

            <Button type="submit" loading={saving} icon={Shield}>
              Update Password
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="font-semibold text-text-primary mb-4">Two-Factor Authentication</h3>
            <p className="text-sm text-text-secondary mb-4">
              Add an extra layer of security to your account
            </p>
            <Button variant="outline" disabled>
              Enable 2FA (Coming Soon)
            </Button>
          </div>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Notification Preferences
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-text-primary mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">New Registrations</p>
                    <p className="text-sm text-text-secondary">
                      Get notified when someone registers for your event
                    </p>
                  </div>
                  <Toggle
                    checked={notifications.emailRegistrations}
                    onChange={(v) => handleNotificationChange('emailRegistrations', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">Payment Received</p>
                    <p className="text-sm text-text-secondary">
                      Get notified when a payment is completed
                    </p>
                  </div>
                  <Toggle
                    checked={notifications.emailPayments}
                    onChange={(v) => handleNotificationChange('emailPayments', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">Event Reminders</p>
                    <p className="text-sm text-text-secondary">
                      Receive reminders before your events
                    </p>
                  </div>
                  <Toggle
                    checked={notifications.emailReminders}
                    onChange={(v) => handleNotificationChange('emailReminders', v)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-medium text-text-primary mb-4">Browser Notifications</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Push Notifications</p>
                  <p className="text-sm text-text-secondary">
                    Receive notifications in your browser
                  </p>
                </div>
                <Toggle
                  checked={notifications.browserNotifications}
                  onChange={(v) => handleNotificationChange('browserNotifications', v)}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Payment Settings
          </h2>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-text-primary mb-2">Razorpay Integration</h3>
              <p className="text-sm text-text-secondary mb-4">
                Your Razorpay account is connected and ready to accept payments.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full" />
                <span className="text-sm text-success font-medium">Connected</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-text-primary mb-4">Payment Methods Accepted</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => (
                  <div
                    key={method}
                    className="p-3 bg-gray-50 rounded-lg text-center text-sm text-text-secondary"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-medium text-text-primary mb-2">Bank Account</h3>
              <p className="text-sm text-text-secondary mb-4">
                Payments are settled to your linked Razorpay account
              </p>
              <Button variant="outline" disabled>
                Manage in Razorpay Dashboard
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Settings;
