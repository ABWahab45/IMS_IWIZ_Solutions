import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { getAvatarImageUrl } from '../../utils/imageUtils';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('phone', profileData.phone);
      
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setAvatar(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                {user?.avatar ? (
                  <img
                    src={getAvatarImageUrl(user.avatar)}
                    alt={user.firstName}
                    className="rounded-circle"
                    width="100"
                    height="100"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{width: '100px', height: '100px', fontSize: '2rem'}}>
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              <h5>{user?.firstName} {user?.lastName}</h5>
              <p className="text-muted">{user?.email}</p>
              <span className={`badge bg-${user?.role === 'admin' ? 'danger' : user?.role === 'manager' ? 'warning' : 'info'}`}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="card mt-3">
            <div className="card-body">
              <div className="nav flex-column nav-pills">
                <button
                  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fas fa-user me-2"></i>
                  Profile Information
                </button>
                <button
                  className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  <i className="fas fa-lock me-2"></i>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-9">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                {activeTab === 'profile' ? 'Profile Information' : 'Change Password'}
              </h5>
            </div>
            <div className="card-body">
              {activeTab === 'profile' ? (
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="form-control"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="form-control"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={user?.email || ''}
                      disabled
                    />
                    <small className="form-text text-muted">Email cannot be changed</small>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="role" className="form-label">Role</label>
                    <input
                      type="text"
                      id="role"
                      className="form-control"
                      value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ''}
                      disabled
                    />
                    <small className="form-text text-muted">Role cannot be changed</small>
                  </div>
                  
                  <div className="form-group mb-4">
                    <label htmlFor="avatar" className="form-label">Profile Picture</label>
                    <input
                      type="file"
                      id="avatar"
                      className="form-control"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <small className="form-text text-muted">Choose a new profile picture (optional)</small>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Update Profile
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className="form-control"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="form-control"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                    <small className="form-text text-muted">Password must be at least 6 characters long</small>
                  </div>
                  
                  <div className="form-group mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key me-2"></i>
                        Change Password
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;