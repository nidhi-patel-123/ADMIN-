import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockClosedIcon, BellIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Loader component matching existing loader style
const Loader = () => (
  <div className="flex flex-col items-center justify-center min-h-[200px]">
    <svg className="animate-spin h-8 w-8 text-[#113a69] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
    <span className="text-gray-500 font-medium">Loading...</span>
  </div>
);

const TABS = [
  { key: 'changepassword', label: 'Change Password', icon: <LockClosedIcon className="w-5 h-5 mr-1" /> },
  { key: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5 mr-1" /> },
  // { key: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5 mr-1" /> },
];

const SettingsPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Default settings (light theme only)
  const [settings, setSettings] = useState({
    email: '',
    theme: 'light',
    notifications: { email: false },
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // For form actions
  const [fetching, setFetching] = useState(false); // For initial fetch
  const [emailChanged, setEmailChanged] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [activeTab, setActiveTab] = useState('changepassword');

  const emailInputRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      setFetching(true);
      setError('');
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('Session expired. Please log in again.');
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data || {};
        setSettings({
          email: data.email || '',
          theme: 'light', // always light
          notifications: data.notifications || { email: false },
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load settings'
        );
      } finally {
        setFetching(false);
      }
    };

    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  // Profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setEmailChanged(false);

    // Validate email
    if (!settings.email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(settings.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      emailInputRef.current?.focus();
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Session expired. Please log in again.');
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/admin/settings/profile`,
        { email: settings.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings((prev) => ({
        ...prev,
        email: response.data.admin.email || prev.email,
      }));
      setSuccess('Profile updated successfully');
      toast.success('Email updated successfully!', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setEmailChanged(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  // Password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      setError('All password fields are required');
      setLoading(false);
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New password and confirm password do not match');
      setLoading(false);
      return;
    }
    if (passwords.currentPassword === passwords.newPassword) {
      setError('New password must be different from current password');
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Session expired. Please log in again.');
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/admin/settings/password`,
        passwords,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Password updated successfully');
      toast.success('Password updated successfully!', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update password'
      );
    } finally {
      setLoading(false);
    }
  };

  // Notification toggle
  const handleNotificationToggle = async () => {
    setError('');
    setSuccess('');
    const newNotifications = { email: !settings.notifications.email };
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Session expired. Please log in again.');
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/admin/settings/notifications`,
        { notifications: newNotifications },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings((prev) => ({ ...prev, notifications: newNotifications }));
      setSuccess('Notification settings updated successfully');
      toast.success('Notification settings updated successfully!', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update notifications'
      );
    } finally {
      setLoading(false);
    }
  };

  // UX: Clear success/error after 4s
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // UX: Focus email input if email changed
  useEffect(() => {
    if (emailChanged) {
      emailInputRef.current?.focus();
    }
  }, [emailChanged]);

  // UX: Keyboard accessibility for toggling password visibility
  const handleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 sm:p-10 mt-10 mb-10">
        <div className="flex items-center space-x-2 mb-6">
          <UserIcon className="w-6 h-6 text-[#113a69]" />
          <h2 className="text-lg font-semibold text-gray-800">Admin Settings</h2>
        </div>

        {(error || success) && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
              error
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
            role="alert"
            aria-live="polite"
          >
            {error || success}
          </div>
        )}

        <h3 className="text-2xl font-bold text-gray-800 mb-2">Manage Your Settings</h3>
        <p className="text-gray-500 mb-6">Update your profile, password, and preferences</p>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-2 border-b border-gray-200" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`px-4 py-2 flex items-center font-medium text-sm rounded-t-lg focus:outline-none transition
                  ${
                    activeTab === tab.key
                      ? 'bg-blue-50 text-[#113a69] border-b-2 border-[#113a69]'
                      : 'text-gray-500 hover:text-[#1b5393]'
                  }
                `}
                aria-selected={activeTab === tab.key}
                tabIndex={0}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && (
            <>
              {/* Profile Update */}
              <form
                onSubmit={handleProfileSubmit}
                className="mb-8"
                autoComplete="off"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Profile</h4>
                <div className="relative mb-4">
                  <UserIcon className="w-5 h-5 absolute left-3 top-3 text-[#113a69] pointer-events-none" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    placeholder="Email"
                    value={settings.email}
                    onChange={(e) => {
                      setSettings({ ...settings, email: e.target.value });
                      setEmailChanged(true);
                    }}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69] transition ${
                      error && error.toLowerCase().includes('email')
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                    disabled={loading}
                    required
                    autoComplete="username"
                    aria-label="Email"
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full bg-[#113a69] text-white py-2 rounded-lg hover:bg-[#1b5393] transition flex items-center justify-center`}
                  disabled={loading || !settings.email}
                  aria-busy={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Saving...' : 'Update Email'}
                </button>
              </form>
            </>
          )}

          {activeTab === 'changepassword' && (
            <>
              {/* Password Update */}
              <form
                onSubmit={handlePasswordSubmit}
                className="mb-8"
                autoComplete="off"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h4>
                <div className="relative mb-4">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-[#113a69] pointer-events-none" />
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    placeholder="Current Password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border-gray-300"
                    disabled={loading}
                    required
                    autoComplete="current-password"
                    aria-label="Current Password"
                  />
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label={showPassword.current ? "Hide password" : "Show password"}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-[#113a69] focus:outline-none"
                    onClick={() => handleShowPassword('current')}
                  >
                    {showPassword.current ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c1.657 0 3.234.336 4.675.938M19.07 4.93a10.05 10.05 0 012.03 2.03M21.542 12c-1.274 4.057-5.065 7-9.542 7-1.657 0-3.234-.336-4.675-.938M4.93 19.07a10.05 10.05 0 01-2.03-2.03" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="relative mb-4">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-[#113a69] pointer-events-none" />
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    placeholder="New Password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border-gray-300"
                    disabled={loading}
                    required
                    autoComplete="new-password"
                    aria-label="New Password"
                  />
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label={showPassword.new ? "Hide password" : "Show password"}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600 focus:outline-none"
                    onClick={() => handleShowPassword('new')}
                  >
                    {showPassword.new ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c1.657 0 3.234.336 4.675.938M19.07 4.93a10.05 10.05 0 012.03 2.03M21.542 12c-1.274 4.057-5.065 7-9.542 7-1.657 0-3.234-.336-4.675-.938M4.93 19.07a10.05 10.05 0 01-2.03-2.03" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="relative mb-4">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-[#113a69] pointer-events-none" />
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border-gray-300"
                    disabled={loading}
                    required
                    autoComplete="new-password"
                    aria-label="Confirm New Password"
                  />
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600 focus:outline-none"
                    onClick={() => handleShowPassword('confirm')}
                  >
                    {showPassword.confirm ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c1.657 0 3.234.336 4.675.938M19.07 4.93a10.05 10.05 0 012.03 2.03M21.542 12c-1.274 4.057-5.065 7-9.542 7-1.657 0-3.234-.336-4.675-.938M4.93 19.07a10.05 10.05 0 01-2.03-2.03" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  className={`w-full bg-[#113a69] text-white py-2 rounded-lg hover:bg-[#1b5393] transition disabled:bg-blue-400 flex items-center justify-center`}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Saving...' : 'Update Password'}
                </button>
              </form>
            </>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h4>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={handleNotificationToggle}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-400 border-gray-300 rounded"
                  disabled={loading}
                  aria-checked={settings.notifications.email}
                  aria-label="Email Notifications"
                />
                <BellIcon className="w-5 h-5 text-blue-500" />
                <span className="text-gray-800">Email Notifications</span>
              </label>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SettingsPage;