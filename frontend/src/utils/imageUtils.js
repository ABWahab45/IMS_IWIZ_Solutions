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
  if (!image) return null;
  
  // If image is an object with url property
  if (typeof image === 'object' && image.url) {
    let url = image.url;
    
    // Handle old format: "uploads/products/filename.png" -> "/uploads/products/filename.png"
    if (url.startsWith('uploads/')) {
      url = '/' + url;
    }
    
    // If it already starts with /uploads, return as is
    if (url.startsWith('/uploads/')) {
      return url;
    }
    
    // If it's just a filename, construct the path
    if (type === 'avatar') {
      return `/uploads/avatars/${url}`;
    } else if (type === 'product') {
      return `/uploads/products/${url}`;
    }
    return `/uploads/products/${url}`;
  }
  
  // If image is a string
  if (typeof image === 'string') {
    let url = image;
    
    // Handle old format: "uploads/products/filename.png" -> "/uploads/products/filename.png"
    if (url.startsWith('uploads/')) {
      url = '/' + url;
    }
    
    // If it already starts with /uploads, return as is
    if (url.startsWith('/uploads/')) {
      return url;
    }
    
    // If it's just a filename, construct the path
    if (type === 'avatar') {
      return `/uploads/avatars/${url}`;
    } else if (type === 'product') {
      return `/uploads/products/${url}`;
    }
    
    // Default to products
    return `/uploads/products/${url}`;
  }
  
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
