const getBackendBaseUrl = () => {
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  if (process.env.REACT_APP_API_URL) {
    const baseUrl = process.env.REACT_APP_API_URL.replace('/api', '');
    return baseUrl;
  }
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const productionUrl = 'https://ims-iwiz-solutions.onrender.com';
    return productionUrl;
  }
  const localUrl = 'http://localhost:5000';
  return localUrl;
};

const getImageUrl = (image, type = 'product') => {
  if (!image) {
    return null;
  }

  // If image is an object with a url property
  if (typeof image === 'object' && image.url) {
    const url = image.url;
    // If it's already a full URL (Cloudinary), return it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // For backward compatibility with old local file paths
    const baseUrl = getBackendBaseUrl();
    if (url.startsWith('/uploads/')) {
      return `${baseUrl}${url}`;
    }
    return `${baseUrl}/uploads/${type === 'avatar' ? 'avatars' : 'products'}/${url}`;
  }

  // If image is a string
  if (typeof image === 'string') {
    // If it's already a full URL (Cloudinary), return it as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    // For backward compatibility with old local file paths
    const baseUrl = getBackendBaseUrl();
    if (image.startsWith('/uploads/')) {
      return `${baseUrl}${image}`;
    }
    return `${baseUrl}/uploads/${type === 'avatar' ? 'avatars' : 'products'}/${image}`;
  }

  return null;
};

const getAvatarImageUrl = (avatar) => {
  return getImageUrl(avatar, 'avatar');
};

const getProductImageUrl = (product) => {
  return getImageUrl(product, 'product');
};

const handleImageError = (event) => {
  event.target.style.display = 'none';
  if (event.target.nextSibling) {
    event.target.nextSibling.style.display = 'flex';
  }
};

const createImagePlaceholder = (type = 'product', text = 'No image') => {
  return (
    <div className={`image-placeholder bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center`}>
      <div className="text-center">
        <i className={`fas fa-${type === 'avatar' ? 'user' : 'image'} fa-2x text-muted mb-2`}></i>
        <p className="text-muted small mb-0">{text}</p>
      </div>
    </div>
  );
};

export {
  getImageUrl,
  getAvatarImageUrl,
  getProductImageUrl,
  handleImageError,
  createImagePlaceholder
};
