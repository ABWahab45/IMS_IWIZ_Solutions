import React, { useState } from 'react';
import api from '../../services/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = [];

    try {
      // Test 1: Check API base URL
      const baseURL = api.defaults.baseURL;
      results.push({
        test: 'API Base URL',
        status: 'info',
        message: `Current API URL: ${baseURL}`
      });

      // Test 2: Check environment variables
      results.push({
        test: 'Environment Variables',
        status: 'info',
        message: `REACT_APP_API_URL: ${process.env.REACT_APP_API_URL || 'Not set'}`
      });

      // Test 3: Test backend health
      try {
        const healthResponse = await api.get('/health');
        results.push({
          test: 'Backend Health',
          status: 'success',
          message: `Backend is running: ${healthResponse.data.message}`
        });
      } catch (error) {
        results.push({
          test: 'Backend Health',
          status: 'error',
          message: `Backend connection failed: ${error.message}`
        });
      }

      // Test 4: Test CORS
      try {
        const corsResponse = await api.get('/cors-test');
        results.push({
          test: 'CORS Test',
          status: 'success',
          message: `CORS is working: ${corsResponse.data.message}`
        });
      } catch (error) {
        results.push({
          test: 'CORS Test',
          status: 'error',
          message: `CORS failed: ${error.message}`
        });
      }

      // Test 5: Test login endpoint (without credentials)
      try {
        const loginResponse = await api.post('/auth/login', {
          email: 'test@test.com',
          password: 'test'
        });
        results.push({
          test: 'Login Endpoint',
          status: 'success',
          message: 'Login endpoint is accessible'
        });
      } catch (error) {
        if (error.response?.status === 401) {
          results.push({
            test: 'Login Endpoint',
            status: 'success',
            message: 'Login endpoint is accessible (401 expected for invalid credentials)'
          });
        } else {
          results.push({
            test: 'Login Endpoint',
            status: 'error',
            message: `Login endpoint failed: ${error.message}`
          });
        }
      }

    } catch (error) {
      results.push({
        test: 'General Error',
        status: 'error',
        message: `Test failed: ${error.message}`
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'error': return 'text-danger';
      case 'info': return 'text-info';
      default: return 'text-muted';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">🔧 API Connection Test</h5>
      </div>
      <div className="card-body">
        <button 
          className="btn btn-primary mb-3" 
          onClick={runTests}
          disabled={loading}
        >
          {loading ? 'Running Tests...' : 'Run API Tests'}
        </button>

        {testResults && (
          <div className="mt-3">
            <h6>Test Results:</h6>
            {testResults.map((result, index) => (
              <div key={index} className={`mb-2 ${getStatusColor(result.status)}`}>
                <strong>{result.test}:</strong> {result.message}
              </div>
            ))}
          </div>
        )}

        <div className="mt-3">
          <h6>Debug Information:</h6>
          <div className="small text-muted">
            <div>Current Hostname: {window.location.hostname}</div>
            <div>Current Origin: {window.location.origin}</div>
            <div>Environment: {process.env.NODE_ENV}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
