import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginDebug = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const { login } = useAuth();

  const testLogin = async () => {
    setDebugInfo('Testing login...');
    
    try {
      // Clear any existing tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('=== LOGIN DEBUG START ===');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Current hostname:', window.location.hostname);
      console.log('User agent:', navigator.userAgent);
      
      const result = await login(email, password);
      
      console.log('Login result:', result);
      console.log('Stored token:', localStorage.getItem('token'));
      console.log('Stored user:', localStorage.getItem('user'));
      console.log('=== LOGIN DEBUG END ===');
      
      setDebugInfo({
        success: result.success,
        error: result.error,
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user')
      });
      
    } catch (error) {
      console.error('Login debug error:', error);
      setDebugInfo({
        success: false,
        error: error.message
      });
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    setDebugInfo('Storage cleared');
  };

  const checkStorage = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setDebugInfo({
      token: token ? 'Present' : 'Not found',
      user: user ? 'Present' : 'Not found',
      tokenLength: token ? token.length : 0
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Login Debug Tool</h3>
      
      <div className="space-y-3 mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={testLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Login
        </button>
        <button
          onClick={clearStorage}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Storage
        </button>
        <button
          onClick={checkStorage}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Check Storage
        </button>
      </div>

      {debugInfo && (
        <div className="p-3 bg-white border rounded">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LoginDebug;
