import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/axiosConfig';
import { getImageUrl, getAvatarImageUrl, getProductImageUrl } from '../../utils/imageUtils';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [testImage, setTestImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }));
      toast.success(`${testName} test passed!`);
    } catch (error) {
      console.error(`${testName} test failed:`, error);
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }));
      toast.error(`${testName} test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    const response = await api.get('/health');
    return response.data;
  };

  const testImageUrlConstruction = () => {
    const testCases = [
      { input: 'test.jpg', type: 'avatar', expected: 'avatar' },
      { input: 'product.png', type: 'product', expected: 'product' },
      { input: { url: '/uploads/products/test.jpg' }, type: 'product', expected: 'product' },
      { input: { url: 'uploads/avatars/user.jpg' }, type: 'avatar', expected: 'avatar' }
    ];

    const results = testCases.map(testCase => {
      const result = getImageUrl(testCase.input, testCase.type);
      return {
        input: testCase.input,
        type: testCase.type,
        result,
        isValid: result && result.includes('/uploads/')
      };
    });

    return results;
  };

  const testImageUpload = async () => {
    if (!testImage) {
      throw new Error('Please select an image first');
    }

    const formData = new FormData();
    formData.append('avatar', testImage);

    const response = await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setTestImage(file);
    
    if (file) {
      // Test URL construction with the selected file
      const testUrl = getImageUrl(file.name, 'avatar');
      setImageUrl(testUrl);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">API and Image Upload Testing</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>API Tests</h6>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => runTest('API Connection', testApiConnection)}
                  disabled={loading}
                >
                  Test API Connection
                </button>
                
                <button
                  className="btn btn-info"
                  onClick={() => runTest('Image URL Construction', testImageUrlConstruction)}
                  disabled={loading}
                >
                  Test Image URL Construction
                </button>
              </div>

              <h6 className="mt-4">Image Upload Test</h6>
              <div className="mb-3">
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              
              {testImage && (
                <div className="mb-3">
                  <p><strong>Selected file:</strong> {testImage.name}</p>
                  <p><strong>Constructed URL:</strong> {imageUrl}</p>
                  <button
                    className="btn btn-success"
                    onClick={() => runTest('Image Upload', testImageUpload)}
                    disabled={loading}
                  >
                    Test Image Upload
                  </button>
                </div>
              )}
            </div>

            <div className="col-md-6">
              <h6>Test Results</h6>
              <div className="test-results">
                {Object.entries(testResults).map(([testName, result]) => (
                  <div key={testName} className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
                    <h6>{testName}</h6>
                    {result.success ? (
                      <pre className="mb-0">{JSON.stringify(result.data, null, 2)}</pre>
                    ) : (
                      <p className="mb-0">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
