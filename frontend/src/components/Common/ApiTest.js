import React, { useState } from 'react';
import apiService from '../../services/api';

const ApiTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const result = await apiService.testConnection();
      setTestResult({ success: true, data: result });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAuthEndpoints = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Test register endpoint
      const registerResponse = await apiService.post('/auth/register', {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'manager'
      });
      setTestResult({ success: true, data: registerResponse });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testApiConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Health Endpoint'}
        </button>
        
        <button
          onClick={testAuthEndpoints}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Testing...' : 'Test Auth Endpoints'}
        </button>
      </div>

      {testResult && (
        <div className={`p-3 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h4 className="font-semibold">
            {testResult.success ? '✅ Success' : '❌ Error'}
          </h4>
          <pre className="text-sm mt-2 overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Current API URL:</strong> {apiService.API_BASE_URL || 'Not set'}</p>
        <p><strong>Hostname:</strong> {window.location.hostname}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
      </div>
    </div>
  );
};

export default ApiTest;
