import React, { useState } from 'react';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';

const ImageWithFallback = ({ 
  src, 
  alt, 
  type = 'product', 
  className = '', 
  style = {}, 
  fallbackSrc = null,
  showPlaceholder = true,
  placeholderText = 'Image not available',
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = getImageUrl(src, type);
  
  const handleError = (event) => {
    console.error('Image failed to load:', event.target.src);
    setImageError(true);
    
    if (fallbackSrc) {
      event.target.src = fallbackSrc;
      setImageError(false);
    }
  };

  const handleLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // If no image source provided, show placeholder
  if (!src) {
    return (
      <div 
        className={`image-placeholder text-center bg-secondary bg-opacity-10 rounded ${className}`}
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div>
          <i className={`fas fa-${type === 'avatar' ? 'user' : 'image'} fa-2x text-muted mb-2`}></i>
          <p className="text-muted small mb-0">{placeholderText}</p>
        </div>
      </div>
    );
  }

  // If image failed to load and no fallback, show placeholder
  if (imageError && !fallbackSrc && showPlaceholder) {
    return (
      <div 
        className={`image-placeholder text-center bg-secondary bg-opacity-10 rounded ${className}`}
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div>
          <i className={`fas fa-${type === 'avatar' ? 'user' : 'image'} fa-2x text-muted mb-2`}></i>
          <p className="text-muted small mb-0">{placeholderText}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <img
        src={imageUrl}
        alt={alt || 'Image'}
        className={className}
        style={{
          ...style,
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      {!imageLoaded && !imageError && (
        <div 
          className={`image-loading text-center bg-secondary bg-opacity-10 rounded ${className}`}
          style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageWithFallback;
