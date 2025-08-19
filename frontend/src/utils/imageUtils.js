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
    if (process.env.REACT_APP_API_URL) {
      const baseUrl = process.env.REACT_APP_API_URL.replace('/api', '');
      console.log(`getImageUrl: Using REACT_APP_API_URL base: ${baseUrl}`);
      return baseUrl;
    }
    
    if (window.location.hostname !== 'localhost') {
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
    const defaultUrl = `${backendBaseUrl}/uploads/products/${url}`;
    console.log(`getImageUrl: Default URL: ${defaultUrl}`);
    return defaultUrl;
  }
  
  // If image is a string
  if (typeof image === 'string') {
    let url = image;
    console.log(`getImageUrl: Processing string: ${url}`);
    
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
    
    // Default to products
    const defaultUrl = `${backendBaseUrl}/uploads/products/${url}`;
    console.log(`getImageUrl: Default URL: ${defaultUrl}`);
    return defaultUrl;
  }
  
  console.log(`getImageUrl: Could not process image:`, image);
  return null;
};

/**
 * Get avatar URL for user
 * @param {string|object} avatar - Avatar path or object
 * @returns {string} - Avatar URL
 */
export const getAvatarUrl = (avatar) => {
  return getImageUrl(avatar, 'avatar');
};

/**
 * Get product image URL
 * @param {string|object} image - Image path or object
 * @returns {string} - Product image URL
 */
export const getProductImageUrl = (image) => {
  return getImageUrl(image, 'product');
};
