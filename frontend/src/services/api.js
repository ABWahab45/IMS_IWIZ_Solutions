import axios from 'axios';

// Function to check if server PC is likely online (9 AM to 6 PM)
const isServerPCAvailable = () => {
  const now = new Date();
  const hour = now.getHours();
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5; // Monday to Friday
  
  // Server PC available: 9 AM to 6 PM on weekdays
  return isWeekday && hour >= 9 && hour < 18;
};

// Function to test backend availability
const testBackendAvailability = async (url) => {
  try {
    const response = await axios.get(`${url}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Backend ${url} is not available:`, error.message);
    return false;
  }
};

const getBaseURL = async () => {
  console.log('🔍 API Configuration Debug:');
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
  console.log('REACT_APP_BACKEND_MODE:', process.env.REACT_APP_BACKEND_MODE);
  console.log('window.location.hostname:', window.location.hostname);
  console.log('window.location.origin:', window.location.origin);
  
  // Check for explicit API URL in environment variables
  if (process.env.REACT_APP_API_URL) {
    console.log('✅ Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Check for backend mode configuration
  if (process.env.REACT_APP_BACKEND_MODE) {
    const mode = process.env.REACT_APP_BACKEND_MODE.toLowerCase();
    
    if (mode === 'cloudflare' && process.env.REACT_APP_CLOUDFLARE_API_URL) {
      console.log('✅ Using Cloudflare backend:', process.env.REACT_APP_CLOUDFLARE_API_URL);
      return process.env.REACT_APP_CLOUDFLARE_API_URL;
    }
    
    if (mode === 'render' && process.env.REACT_APP_RENDER_API_URL) {
      console.log('✅ Using Render backend:', process.env.REACT_APP_RENDER_API_URL);
      return process.env.REACT_APP_RENDER_API_URL;
    }
  }
  
  // Check if we're in production (not localhost)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // For production, implement smart backend selection
    const serverPCAvailable = isServerPCAvailable();
    console.log('🕐 Server PC availability check:', serverPCAvailable);
    
    // Try Cloudflare backend first if server PC should be available
    if (serverPCAvailable && process.env.REACT_APP_CLOUDFLARE_API_URL) {
      const cloudflareAvailable = await testBackendAvailability(process.env.REACT_APP_CLOUDFLARE_API_URL);
      if (cloudflareAvailable) {
        console.log('✅ Using Cloudflare backend (server PC active):', process.env.REACT_APP_CLOUDFLARE_API_URL);
        return process.env.REACT_APP_CLOUDFLARE_API_URL;
      }
    }
    
    // Fallback to Render backend
    if (process.env.REACT_APP_RENDER_API_URL) {
      const renderAvailable = await testBackendAvailability(process.env.REACT_APP_RENDER_API_URL);
      if (renderAvailable) {
        console.log('✅ Using Render backend (fallback):', process.env.REACT_APP_RENDER_API_URL);
        return process.env.REACT_APP_RENDER_API_URL;
      }
    }
    
    // Final fallback to Render.com URL
    const productionUrl = 'https://ims-iwiz-solutions.onrender.com/api';
    console.log('✅ Using fallback production URL:', productionUrl);
    return productionUrl;
  }
  
  // Local development - force localhost:5000
  const localUrl = 'http://localhost:5000/api';
  console.log('✅ Using local development URL:', localUrl);
  return localUrl;
};

// Initialize API with dynamic base URL
let api = null;

const initializeApi = async () => {
  if (!api) {
    const baseURL = await getBaseURL();
    api = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add interceptors
    api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        console.error('❌ API Response Error:', error.response?.status, error.response?.data);
        
        // If current backend fails, try switching to another
        if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
          console.log('🔄 Backend failed, attempting to switch...');
          const newBaseURL = await getBaseURL();
          if (newBaseURL !== api.defaults.baseURL) {
            api.defaults.baseURL = newBaseURL;
            console.log('✅ Switched to backup backend:', newBaseURL);
            // Retry the request
            return api.request(error.config);
          }
        }
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  return api;
};

// Export the initialized API
const getApi = async () => {
  return await initializeApi();
};

export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing API connection...');
    const apiInstance = await getApi();
    const response = await apiInstance.get('/health');
    console.log('✅ API connection test successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Connection Test Failed:', error);
    throw error;
  }
};

// Function to switch backend dynamically
export const switchBackend = async (backendType) => {
  let newBaseURL = '';
  
  switch (backendType.toLowerCase()) {
    case 'render':
      newBaseURL = process.env.REACT_APP_RENDER_API_URL || 'https://ims-iwiz-solutions.onrender.com/api';
      break;
    case 'cloudflare':
      newBaseURL = process.env.REACT_APP_CLOUDFLARE_API_URL || '';
      break;
    case 'local':
      newBaseURL = 'http://localhost:5000/api';
      break;
    default:
      console.error('❌ Unknown backend type:', backendType);
      return false;
  }
  
  if (newBaseURL) {
    if (api) {
      api.defaults.baseURL = newBaseURL;
    }
    console.log(`🔄 Switched to ${backendType} backend:`, newBaseURL);
    return true;
  }
  
  return false;
};

// Function to get current backend info
export const getCurrentBackend = async () => {
  const apiInstance = await getApi();
  return {
    baseURL: apiInstance.defaults.baseURL,
    backendType: getBackendTypeFromURL(apiInstance.defaults.baseURL)
  };
};

const getBackendTypeFromURL = (url) => {
  if (url.includes('localhost')) return 'local';
  if (url.includes('render.com')) return 'render';
  if (url.includes('trycloudflare.com') || url.includes('cloudflare')) return 'cloudflare';
  return 'unknown';
};

// Create a synchronous API instance for backward compatibility
let syncApi = null;

// Initialize synchronous API instance
const initSyncApi = async () => {
  if (!syncApi) {
    syncApi = await getApi();
  }
  return syncApi;
};

// Initialize immediately
initSyncApi().then(api => {
  syncApi = api;
}).catch(err => {
  console.error('Failed to initialize API:', err);
});

// Export default API instance (synchronous access)
export default {
  get: async (...args) => {
    const api = await getApi();
    return api.get(...args);
  },
  post: async (...args) => {
    const api = await getApi();
    return api.post(...args);
  },
  put: async (...args) => {
    const api = await getApi();
    return api.put(...args);
  },
  delete: async (...args) => {
    const api = await getApi();
    return api.delete(...args);
  },
  defaults: {
    get baseURL() {
      return syncApi?.defaults?.baseURL || 'http://localhost:5000/api';
    }
  }
};

// Also export the async function for new usage
export const getApiInstance = async () => {
  return await getApi();
};