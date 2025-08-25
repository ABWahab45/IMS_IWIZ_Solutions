import axios from 'axios';



// Function to test backend availability
const testBackendAvailability = async (url) => {
  try {
    const response = await axios.get(`${url}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const getBaseURL = async () => {
  
  // Check for explicit API URL in environment variables
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Check for backend mode configuration
  if (process.env.REACT_APP_BACKEND_MODE) {
    const mode = process.env.REACT_APP_BACKEND_MODE.toLowerCase();
    
    if (mode === 'render' && process.env.REACT_APP_RENDER_API_URL) {
      return process.env.REACT_APP_RENDER_API_URL;
    }
  }
  
  // Check if we're in production (not localhost)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // For production, use Render backend
    if (process.env.REACT_APP_RENDER_API_URL) {
      const renderAvailable = await testBackendAvailability(process.env.REACT_APP_RENDER_API_URL);
      if (renderAvailable) {
        return process.env.REACT_APP_RENDER_API_URL;
      }
    }
    
    // Fallback to Render.com URL
    const productionUrl = 'https://ims-iwiz-solutions.onrender.com/api';
    return productionUrl;
  }
  
  // Local development - force localhost:5000
  const localUrl = 'http://localhost:5000/api';
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
          const newBaseURL = await getBaseURL();
          if (newBaseURL !== api.defaults.baseURL) {
            api.defaults.baseURL = newBaseURL;
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
    const apiInstance = await getApi();
    const response = await apiInstance.get('/health');
    return response.data;
  } catch (error) {
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