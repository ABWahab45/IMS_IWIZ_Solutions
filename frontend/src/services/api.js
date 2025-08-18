// Determine API URL based on environment
const getApiBaseUrl = () => {
  // Log current environment for debugging
  console.log('Current hostname:', window.location.hostname);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  
  if (process.env.REACT_APP_API_URL) {
    console.log('Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Check if we're in production (deployed on Vercel)
  if (window.location.hostname !== 'localhost') {
    const productionUrl = 'https://ims-iwiz-solutions.onrender.com/api';
    console.log('Using production URL:', productionUrl);
    return productionUrl;
  }
  
  const localUrl = 'http://localhost:5000/api';
  console.log('Using local URL:', localUrl);
  return localUrl;
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  constructor() {
    this.API_BASE_URL = API_BASE_URL;
  }
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Log the response for debugging
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      console.log(`Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Request URL:', url);
      console.error('Request config:', config);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Test connection method
  async testConnection() {
    try {
      console.log('Testing API connection...');
      const response = await this.get('/health');
      console.log('✅ API connection successful:', response);
      return response;
    } catch (error) {
      console.error('❌ API connection failed:', error);
      throw error;
    }
  }
}

export default new ApiService();