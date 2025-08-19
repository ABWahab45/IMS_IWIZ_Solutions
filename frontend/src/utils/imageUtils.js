/**
 * Utility functions for handling image paths consistently
 */

/**
 * Get the correct image URL for display
 * @param {string|object} image - Image object with url property or string path
 * @param {string} type - Type of image ('avatar', 'product', etc.)
 * @returns {string} - Correct image URL
 */
export const getImageUrl = (image, type = 'product') => {
  if (!image) {
    console.log(`getImageUrl: No image provided for type ${type}`);
    return null;
  }
  
  // Get the base URL for the backend
  const getBackendBaseUrl = () => {
    // First check for explicit environment variable
    if (process.env.REACT_APP_BACKEND_URL) {
      console.log(`getImageUrl: Using REACT_APP_BACKEND_URL: ${process.env.REACT_APP_BACKEND_URL}`);
      return process.env.REACT_APP_BACKEND_URL;
    }
    
    if (process.env.REACT_APP_API_URL) {
      const baseUrl = process.env.REACT_APP_API_URL.replace('/api', '');
      console.log(`getImageUrl: Using REACT_APP_API_URL base: ${baseUrl}`);
      return baseUrl;
    }
    
    // Check if we're in production environment
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const productionUrl = 'https://ims-iwiz-solutions.onrender.com';
      console.log(`getImageUrl: Using production URL: ${productionUrl}`);
      return productionUrl;
    }
    
    const localUrl = 'http://localhost:5000';
    console.log(`getImageUrl: Using local URL: ${localUrl}`);
    return localUrl;
  };
  
  const backendBaseUrl = getBackendBaseUrl();
  
  // If image is an object with url property
  if (typeof image === 'object' && image.url) {
    let url = image.url;
    console.log(`getImageUrl: Processing object with url: ${url}`);
    
    // Handle old format: "uploads/products/filename.png" -> "/uploads/products/filename.png"
    if (url.startsWith('uploads/')) {
      url = '/' + url;
      console.log(`getImageUrl: Fixed uploads path: ${url}`);
    }
    
    // If it already starts with /uploads, construct full URL
    if (url.startsWith('/uploads/')) {
      const fullUrl = `${backendBaseUrl}${url}`;
      console.log(`getImageUrl: Constructed full URL: ${fullUrl}`);
      return fullUrl;
    }
    
    // If it's just a filename, construct the path
    if (type === 'avatar') {
      const avatarUrl = `${backendBaseUrl}/uploads/avatars/${url}`;
      console.log(`getImageUrl: Avatar URL: ${avatarUrl}`);
      return avatarUrl;
    } else if (type === 'product') {
      const productUrl = `${backendBaseUrl}/uploads/products/${url}`;
      console.log(`getImageUrl: Product URL: ${productUrl}`);
      return productUrl;
    }
    
    // Default case - assume it's a full URL
    const defaultUrl = `${backendBaseUrl}${url.startsWith('/') ? url : '/' + url}`;
    console.log(`getImageUrl: Default URL: ${defaultUrl}`);
    return defaultUrl;
  }
  
  // If image is a string
  if (typeof image === 'string') {
    console.log(`getImageUrl: Processing string: ${image}`);
    
    // If it's already a full URL, return as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      console.log(`getImageUrl: Full URL detected: ${image}`);
      return image;
    }
    
    // Handle relative paths
    if (image.startsWith('/uploads/')) {
      const fullUrl = `${backendBaseUrl}${image}`;
      console.log(`getImageUrl: Relative path URL: ${fullUrl}`);
      return fullUrl;
    }
    
    // Handle filename only
    if (type === 'avatar') {
      const avatarUrl = `${backendBaseUrl}/uploads/avatars/${image}`;
      console.log(`getImageUrl: Avatar filename URL: ${avatarUrl}`);
      return avatarUrl;
    } else if (type === 'product') {
      const productUrl = `${backendBaseUrl}/uploads/products/${image}`;
      console.log(`getImageUrl: Product filename URL: ${productUrl}`);
      return productUrl;
    }
  }
  
  console.log(`getImageUrl: Could not process image:`, image);
  return null;
};

/**
 * Get product image URL (alias for getImageUrl with type='product')
 * @param {string|object} image - Image object or string
 * @returns {string} - Product image URL
 */
export const getProductImageUrl = (image) => {
  return getImageUrl(image, 'product');
};

/**
 * Get avatar image URL (alias for getImageUrl with type='avatar')
 * @param {string|object} image - Image object or string
 * @returns {string} - Avatar image URL
 */
export const getAvatarImageUrl = (image) => {
  return getImageUrl(image, 'avatar');
};

/**
 * Handle image loading errors with fallback
 * @param {Event} event - Image error event
 * @param {string} fallbackSrc - Fallback image source
 */
export const handleImageError = (event, fallbackSrc = null) => {
  console.error('Image failed to load:', event.target.src);
  
  if (fallbackSrc) {
    event.target.src = fallbackSrc;
  } else {
    // Hide the image and show a placeholder
    event.target.style.display = 'none';
    const placeholder = event.target.nextElementSibling;
    if (placeholder && placeholder.classList.contains('image-placeholder')) {
      placeholder.style.display = 'block';
    }
  }
};

/**
 * Create a placeholder element for when images fail to load
 * @param {string} type - Type of placeholder ('avatar', 'product')
 * @param {string} text - Text to display
 * @returns {string} - HTML string for placeholder
 */
export const createImagePlaceholder = (type = 'product', text = 'Image not available') => {
  const iconClass = type === 'avatar' ? 'fas fa-user' : 'fas fa-image';
  const sizeClass = type === 'avatar' ? 'fa-2x' : 'fa-3x';
  
  return `
    <div class="image-placeholder text-center p-4 bg-secondary bg-opacity-10 rounded" style="display: none;">
      <i class="${iconClass} ${sizeClass} text-muted mb-2"></i>
      <p class="text-muted">${text}</p>
    </div>
  `;
};
