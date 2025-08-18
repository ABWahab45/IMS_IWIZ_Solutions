import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: 'IWIZ Solutions',
    companyEmail: 'admin@iwiz.com',
    companyPhone: '+92 3357366900',
    companyAddress: 'Third Floor, Amjad plaza, Bank Rd, Saddar, Rawalpindi, Punjab 46000',
    currency: 'PKR'
  });

  const handleSettingChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="dashboard fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="fas fa-cog me-2 text-primary"></i>
          General Settings
        </h1>
        <button
          className="btn btn-primary"
          onClick={handleSaveSettings}
        >
          <i className="fas fa-save me-2"></i>
          Save Changes
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8 col-md-10 mx-auto">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-building me-2"></i>
                Company Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.companyName}
                      onChange={(e) => handleSettingChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Company Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={settings.companyEmail}
                      onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                      placeholder="Enter company email"
                    />
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Company Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={settings.companyPhone}
                      onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                      placeholder="Enter company phone"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Currency</label>
                    <select
                      className="form-control"
                      value={settings.currency}
                      onChange={(e) => handleSettingChange('currency', e.target.value)}
                    >
                      <option value="PKR">PKR - Pakistani Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="form-group mb-3">
                <label className="form-label">Company Address</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={settings.companyAddress}
                  onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                  placeholder="Enter company address"
                />
              </div>
              
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Note:</strong> These settings will be used throughout the application for company information display.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;