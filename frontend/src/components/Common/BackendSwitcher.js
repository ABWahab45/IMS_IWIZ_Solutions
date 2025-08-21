import React, { useState, useEffect } from 'react';
import { switchBackend, getCurrentBackend } from '../../services/api';

const BackendSwitcher = () => {
  const [currentBackend, setCurrentBackend] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get current backend info on component mount
    const backendInfo = getCurrentBackend();
    setCurrentBackend(backendInfo);
  }, []);

  const handleBackendSwitch = async (backendType) => {
    setIsLoading(true);
    
    try {
      const success = switchBackend(backendType);
      
      if (success) {
        // Update current backend info
        const newBackendInfo = getCurrentBackend();
        setCurrentBackend(newBackendInfo);
        
        // Show success message
        console.log(`✅ Switched to ${backendType} backend`);
        
        // Optionally reload the page to ensure all components use the new backend
        // window.location.reload();
      } else {
        console.error(`❌ Failed to switch to ${backendType} backend`);
      }
    } catch (error) {
      console.error('❌ Error switching backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBackendDisplayName = (type) => {
    switch (type) {
      case 'render':
        return 'Render (Production)';
      case 'cloudflare':
        return 'Cloudflare (Server)';
      case 'local':
        return 'Local Development';
      default:
        return type;
    }
  };

  const getBackendStatusColor = (type) => {
    switch (type) {
      case 'render':
        return 'text-green-600';
      case 'cloudflare':
        return 'text-blue-600';
      case 'local':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!currentBackend) {
    return <div>Loading backend info...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-3">Backend Configuration</h3>
      
      {/* Current Backend Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Backend:
        </label>
        <div className={`text-sm font-medium ${getBackendStatusColor(currentBackend.backendType)}`}>
          {getBackendDisplayName(currentBackend.backendType)}
        </div>
        <div className="text-xs text-gray-500 mt-1 break-all">
          {currentBackend.baseURL}
        </div>
      </div>

      {/* Backend Switcher Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => handleBackendSwitch('render')}
          disabled={isLoading || currentBackend.backendType === 'render'}
          className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
            currentBackend.backendType === 'render'
              ? 'bg-green-100 text-green-800 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isLoading ? 'Switching...' : 'Switch to Render Backend'}
        </button>

        <button
          onClick={() => handleBackendSwitch('cloudflare')}
          disabled={isLoading || currentBackend.backendType === 'cloudflare'}
          className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
            currentBackend.backendType === 'cloudflare'
              ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isLoading ? 'Switching...' : 'Switch to Cloudflare Backend'}
        </button>

        <button
          onClick={() => handleBackendSwitch('local')}
          disabled={isLoading || currentBackend.backendType === 'local'}
          className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
            currentBackend.backendType === 'local'
              ? 'bg-orange-100 text-orange-800 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isLoading ? 'Switching...' : 'Switch to Local Backend'}
        </button>
      </div>

      {/* Environment Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>Environment: {process.env.NODE_ENV}</div>
          <div>Backend Mode: {process.env.REACT_APP_BACKEND_MODE || 'auto'}</div>
        </div>
      </div>
    </div>
  );
};

export default BackendSwitcher;
