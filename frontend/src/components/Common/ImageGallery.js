import React, { useState } from 'react';
import ImageWithFallback from './ImageWithFallback';
import ImageModal from './ImageModal';
import { getImageUrl } from '../../utils/imageUtils';

const ImageGallery = ({ 
  images = [], 
  type = 'product',
  maxThumbnails = 4,
  className = '',
  style = {}
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`image-gallery ${className}`} style={style}>
        <ImageWithFallback
          src={null}
          alt="No images available"
          type={type}
          className="img-fluid rounded"
          style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
          placeholderText="No images available"
        />
      </div>
    );
  }

  const handleImageClick = (index, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('ImageGallery: Image clicked, index:', index);
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Sort images so primary image comes first
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });

  const primaryImage = sortedImages[0]; // First image is now always primary
  const otherImages = sortedImages.slice(1); // Rest of the images
  
  // Find the index of the primary image in original array for modal display
  const primaryImageIndex = images.findIndex(img => img.isPrimary);
  const displayIndex = primaryImageIndex >= 0 ? primaryImageIndex : 0;

  return (
    <div className={`image-gallery ${className}`} style={style}>
      <style jsx>{`
        .image-gallery .primary-image-container {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
        }
        .image-gallery .primary-image-container:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 35px rgba(0,0,0,0.2);
        }

        .image-gallery .thumbnail-container {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
        }
        .image-gallery .thumbnail-container:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        .image-gallery .more-images {
          transition: all 0.2s ease-in-out;
          border-radius: 8px;
        }
        .image-gallery .more-images:hover {
          transform: scale(1.05);
          background-color: rgba(108, 117, 125, 0.3) !important;
        }
      `}</style>

      {/* Primary Image */}
      <div className="primary-image mb-3">
        <div 
          className="primary-image-container position-relative"
          onClick={(e) => handleImageClick(displayIndex, e)}
          style={{ cursor: 'pointer' }}
        >
          <ImageWithFallback
            src={primaryImage}
            alt={primaryImage?.alt || 'Product image'}
            type={type}
            className="img-fluid"
            style={{ 
              maxHeight: '300px', 
              width: '100%', 
              objectFit: 'cover'
            }}
            placeholderText="No image available"
          />


        </div>
      </div>

      {/* Thumbnail Images */}
      {otherImages.length > 0 && (
        <div className="thumbnail-images">
          <div className="row g-2">
            {otherImages.slice(0, maxThumbnails - 1).map((image, index) => {
              // Find the actual index of this image in the original array
              const actualIndex = images.findIndex(img => img === image);
              return (
                <div key={actualIndex} className="col-3">
                  <div 
                    className="thumbnail-container position-relative"
                    onClick={(e) => handleImageClick(actualIndex, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={image?.alt || `Product image ${actualIndex + 1}`}
                      type={type}
                      className="img-fluid"
                      style={{ 
                        height: '60px', 
                        width: '100%', 
                        objectFit: 'cover'
                      }}
                      placeholderText=""
                    />
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <div className="bg-dark bg-opacity-60 rounded-circle p-2 opacity-0 hover-opacity-100" 
                           style={{ transition: 'opacity 0.2s ease-in-out' }}>
                        <i className="fas fa-search-plus text-white" style={{ fontSize: '0.8rem' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Show "more" indicator if there are more images */}
            {images.length > maxThumbnails && (
              <div className="col-3">
                <div 
                  className="more-images position-relative"
                  onClick={(e) => handleImageClick(0, e)}
                  style={{ 
                    cursor: 'pointer',
                    height: '60px',
                    width: '100%'
                  }}
                >
                  <div 
                    className="bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center h-100"
                    style={{ borderRadius: '8px' }}
                  >
                    <div className="text-center">
                      <i className="fas fa-plus-circle text-muted mb-1 fa-lg"></i>
                      <div className="small text-muted fw-medium">
                        +{images.length - maxThumbnails}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        images={images}
        currentIndex={currentImageIndex}
        type={type}
      />
    </div>
  );
};

export default ImageGallery;
