import React, { useState, useEffect } from 'react';
import './StudentSettings.css';

const StudentSettings = ({ username, onBack }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    class: '',
    section: '',
    phoneNumber: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      sms: false,
      inApp: true
    },
    privacy: {
      showProfile: true
    },
    profilePicture: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // TODO: Replace with actual API call to fetch user data
      // const response = await fetch(`/api/students/${username}`);
      // const data = await response.json();

      // Mock data for now
      setFormData(prev => ({
        ...prev,
        fullName: 'John Doe',
        email: username,
        class: '8',
        section: 'A',
        phoneNumber: '+1234567890'
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: checked
          }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
    }
  };

  const handleSavePersonalDetails = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to update personal details
      // const response = await fetch(`/api/students/${username}/personal`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     fullName: formData.fullName,
      //     email: formData.email,
      //     class: formData.class,
      //     section: formData.section,
      //     phoneNumber: formData.phoneNumber
      //   })
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Personal details updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating personal details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      // TODO: Replace with actual API call to change password
      // const response = await fetch(`/api/students/${username}/password`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     oldPassword: formData.oldPassword,
      //     newPassword: formData.newPassword
      //   })
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Password changed successfully!');
      setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error changing password. Please check your old password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to update preferences
      // const response = await fetch(`/api/students/${username}/preferences`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     notifications: formData.notifications,
      //     privacy: formData.privacy
      //   })
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Preferences updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!formData.profilePicture) return;
    setLoading(true);
    try {
      // TODO: Replace with actual API call to upload profile picture
      // const formDataUpload = new FormData();
      // formDataUpload.append('profilePicture', formData.profilePicture);
      // const response = await fetch(`/api/students/${username}/profile-picture`, {
      //   method: 'POST',
      //   body: formDataUpload
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Profile picture updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error uploading profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-settings">
      <div className="settings-header">
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
        <h1>Settings</h1>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="settings-content">
        {/* Personal Details Section */}
        <div className="settings-section">
          <h2>Personal Details</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Class</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Section</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <button onClick={handleSavePersonalDetails} disabled={loading}>
            {loading ? 'Saving...' : 'Save Personal Details'}
          </button>
        </div>

        {/* Change Password Section */}
        <div className="settings-section">
          <h2>Change Password</h2>
          <div className="form-group">
            <label>Old Password</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
          <button onClick={handleChangePassword} disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <h2>Preferences</h2>
          <div className="form-group">
            <label>Notifications</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="notifications.email"
                  checked={formData.notifications.email}
                  onChange={handleInputChange}
                />
                Email
              </label>
              <label>
                <input
                  type="checkbox"
                  name="notifications.sms"
                  checked={formData.notifications.sms}
                  onChange={handleInputChange}
                />
                SMS
              </label>
              <label>
                <input
                  type="checkbox"
                  name="notifications.inApp"
                  checked={formData.notifications.inApp}
                  onChange={handleInputChange}
                />
                In-App
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Privacy</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="privacy.showProfile"
                  checked={formData.privacy.showProfile}
                  onChange={handleInputChange}
                />
                Show profile to classmates
              </label>
            </div>
          </div>
          <button onClick={handleSavePreferences} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="settings-section">
          <h2>Profile Picture</h2>
          <div className="form-group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <button onClick={handleUploadProfilePicture} disabled={loading || !formData.profilePicture}>
            {loading ? 'Uploading...' : 'Upload Profile Picture'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
