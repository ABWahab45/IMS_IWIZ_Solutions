import React, { useState } from 'react';
import apiService from '../../services/api';

const ApiTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Test with direct fetch to bypass any service worker issues
      const response = await fetch('https://ims-iwiz-solutions.onrender.com/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Direct fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
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
      // Test register endpoint with direct fetch
      const response = await fetch('https://ims-iwiz-solutions.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123',
          role: 'manager'
        }),
      });
      
      console.log('Auth endpoint response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      setTestResult({ success: true, data: result });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testBackendReachability = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Simple test to see if the backend is reachable
      const response = await fetch('https://ims-iwiz-solutions.onrender.com/', {
        method: 'GET',
      });
      
      console.log('Backend root response status:', response.status);
      
      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      };
      
      setTestResult({ success: true, data: result });
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
        
        <button
          onClick={testBackendReachability}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 ml-2"
        >
          {loading ? 'Testing...' : 'Test Backend Reachability'}
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
