import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getImageUrl } from '../../utils/imageUtils';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  images = [], 
  currentIndex = 0,
  type = 'product'
}) => {
  // Find primary image index in original array
  const primaryImageIndex = images.findIndex(img => img.isPrimary);
  const [activeIndex, setActiveIndex] = useState(primaryImageIndex >= 0 ? primaryImageIndex : 0);
  const [imageLoading, setImageLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => {
      // Find current image in original array
      const currentImage = images[prev];
      // Sort images to find position
      const sortedImages = [...images].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
      });
      const currentSortedIndex = sortedImages.findIndex(img => img === currentImage);
      const newSortedIndex = currentSortedIndex > 0 ? currentSortedIndex - 1 : sortedImages.length - 1;
      const newImage = sortedImages[newSortedIndex];
      return images.findIndex(img => img === newImage);
    });
  }, [images]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => {
      // Find current image in original array
      const currentImage = images[prev];
      // Sort images to find position
      const sortedImages = [...images].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
      });
      const currentSortedIndex = sortedImages.findIndex(img => img === currentImage);
      const newSortedIndex = currentSortedIndex < sortedImages.length - 1 ? currentSortedIndex + 1 : 0;
      const newImage = sortedImages[newSortedIndex];
      return images.findIndex(img => img === newImage);
    });
  }, [images]);

  const handleZoom = useCallback((delta, centerX = 0, centerY = 0) => {
    setZoom(prev => {
      const newZoom = Math.max(1, Math.min(5, prev + delta)); // Limit zoom from 1x to 5x
      
      // If zooming out to 1x (original size), reset pan to center
      if (newZoom === 1) {
        setPanX(0);
        setPanY(0);
        return newZoom;
      }
      
      // Calculate zoom center for smooth zooming
      if (centerX !== 0 || centerY !== 0) {
        const zoomRatio = newZoom / prev;
        const newPanX = centerX - (centerX - panX) * zoomRatio;
        const newPanY = centerY - (centerY - panY) * zoomRatio;
        
        setPanX(newPanX);
        setPanY(newPanY);
      }
      
      return newZoom;
    });
  }, [panX, panY]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  }, [zoom, panX, panY]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && zoom > 1) {
      e.preventDefault();
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      
      // Limit panning to prevent image from going too far off screen
      const maxPan = 200;
      setPanX(Math.max(-maxPan, Math.min(maxPan, newPanX)));
      setPanY(Math.max(-maxPan, Math.min(maxPan, newPanY)));
    }
  }, [isDragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      resetZoom();
    } else {
      setZoom(2);
      setPanX(0);
      setPanY(0);
    }
  }, [zoom, resetZoom]);

  useEffect(() => {
    // Always start with primary image
    const primaryIndex = images.findIndex(img => img.isPrimary);
    setActiveIndex(primaryIndex >= 0 ? primaryIndex : 0);
    setImageLoading(true);
    resetZoom(); // Reset zoom when changing images
  }, [currentIndex, resetZoom, images]);

  // Reset zoom when modal opens
  useEffect(() => {
    if (isOpen) {
      resetZoom(); // Always start at 1x zoom when opening modal
    }
  }, [isOpen, resetZoom]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        default:
          break;
      }
    };

    const handleWheel = (e) => {
      if (!isOpen) return;
      
      e.preventDefault();
      
      // Get mouse position relative to the image container
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const centerX = e.clientX - rect.left - rect.width / 2;
      const centerY = e.clientY - rect.top - rect.height / 2;
      
      // Zoom in/out based on scroll direction with more precise control
      const delta = e.deltaY > 0 ? -0.05 : 0.05; // Reduced sensitivity for smoother zoom
      handleZoom(delta, centerX, centerY);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('wheel', handleWheel, { passive: false });
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, goToPrevious, goToNext, onClose, handleZoom, resetZoom]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  const handlePrevious = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    goToPrevious();
  }, [goToPrevious]);

  const handleNext = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    goToNext();
  }, [goToNext]);

  const handleThumbnailClick = useCallback((sortedIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    // Sort images to find the correct image
    const sortedImages = [...images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return 0;
    });
    const clickedImage = sortedImages[sortedIndex];
    const originalIndex = images.findIndex(img => img === clickedImage);
    setActiveIndex(originalIndex);
  }, [images]);

  if (!isOpen || images.length === 0) return null;

  // Sort images so primary image comes first
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });

  // Find the index of the current image in the sorted array
  const sortedActiveIndex = sortedImages.findIndex(img => img === images[activeIndex]);
  const displayIndex = sortedActiveIndex >= 0 ? sortedActiveIndex : activeIndex;

  const currentImage = sortedImages[displayIndex];
  const imageUrl = getImageUrl(currentImage, type);

  const modalContent = (
    <div 
      className="image-modal-overlay"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 30, 0.95) 100%)', 
        backdropFilter: 'blur(20px) saturate(180%)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onClick={handleBackdropClick}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            backdrop-filter: blur(0px);
          }
          to { 
            opacity: 1; 
            backdrop-filter: blur(20px) saturate(180%);
          }
        }
        @keyframes slideIn {
          from { 
            transform: scale(0.8) translateY(30px) rotateX(10deg); 
            opacity: 0; 
          }
          to { 
            transform: scale(1) translateY(0) rotateX(0deg); 
            opacity: 1; 
          }
        }
        @keyframes imageSlideIn {
          from { 
            opacity: 0; 
            transform: scale(0.9) translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
        @keyframes headerSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(-20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        @keyframes slideInFromLeft {
          from { 
            transform: translateX(-30px); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }
        @keyframes slideInFromRight {
          from { 
            transform: translateX(30px); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }
        @keyframes slideInFromBottom {
          from { 
            transform: translateY(30px); 
            opacity: 0; 
          }
          to { 
            transform: translateY(0); 
            opacity: 1; 
          }
        }
        .image-modal-content {
          position: relative;
          max-width: 95vw;
          max-height: 95vh;
          background: transparent;
          border: none;
          pointer-events: auto;
        }
        .modal-header {
          /* No animation - appears in final position */
        }
        .modal-image {
          /* No animation - appears in final position */
        }
        .nav-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(0, 0, 0, 0.8) !important;
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          color: white !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .nav-btn:hover {
          transform: scale(1.1) translateY(-2px);
          background: rgba(0, 0, 0, 0.9) !important;
          border-color: rgba(255, 255, 255, 0.8) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
        }
        .nav-btn:active {
          transform: scale(1.05) translateY(0);
        }
        .nav-btn.prev {
          animation: slideInFromLeft 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-btn.next {
          animation: slideInFromRight 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .thumbnail-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 3px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.6);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }
        .thumbnail-btn:hover {
          transform: scale(1.1) translateY(-2px);
          border-color: rgba(255, 255, 255, 0.6);
          background: rgba(0, 0, 0, 0.8);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        .thumbnail-btn.active {
          border-color: #ffd700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          transform: scale(1.1);
        }
        .close-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(0, 0, 0, 0.8) !important;
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          color: white !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .close-btn:hover {
          transform: scale(1.1) translateY(-2px);
          background: rgba(220, 53, 69, 0.9) !important;
          border-color: rgba(255, 255, 255, 0.8) !important;
          box-shadow: 0 12px 40px rgba(220, 53, 69, 0.4);
        }
        .image-container {
          animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          border-radius: 16px;
          overflow: hidden;
        }
        .thumbnail-container {
          /* No animation - appears in final position */
        }
        .modal-header {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 30, 0.95) 100%);
          backdrop-filter: blur(15px);
          border-radius: 12px;
          padding: 8px 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .image-counter-badge {
          background-color: #6f42c1 !important;
          color: white !important;
          border: none !important;
          border-radius: 20px !important;
          font-size: 0.9rem !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(111, 66, 193, 0.4) !important;
          transition: none !important;
        }
        .image-counter-badge:hover {
          background-color: #6f42c1 !important;
          transform: none !important;
        }
      `}</style>

      <div 
        className="image-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div 
          className="modal-header" 
          style={{ 
            position: 'fixed',
            top: '20px',
            left: '20px',
            right: '20px',
            zIndex: 10001,
            pointerEvents: 'auto'
          }}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            {/* Left side - Name */}
            <div className="flex-grow-1">
              <h5 className="mb-0 fw-bold text-white">
                {currentImage?.alt || `Image ${activeIndex + 1}`}
              </h5>
            </div>
            
                         {/* Center - Image Counter */}
             <div className="d-flex justify-content-center">
               <span className="badge image-counter-badge px-3 py-1">
                 <i className="fas fa-image me-2"></i>
                 {displayIndex + 1} of {sortedImages.length}
               </span>
             </div>
            
                         {/* Right side - Zoom Level, Primary Badge and Close Button */}
             <div className="d-flex align-items-center gap-3">
               {zoom > 1 && (
                 <span 
                   className="badge px-3 py-2"
                   style={{
                     backgroundColor: '#28a745',
                     color: 'white',
                     border: 'none',
                     borderRadius: '20px',
                     fontSize: '0.8rem',
                     fontWeight: '600',
                     boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
                   }}
                 >
                   <i className="fas fa-search-plus me-2"></i>
                   {Math.round(zoom * 100)}%
                 </span>
               )}
               {currentImage?.isPrimary && (
                 <span 
                   className="badge px-3 py-2"
                   style={{
                     backgroundColor: '#ffc107',
                     color: '#000',
                     border: 'none',
                     borderRadius: '20px',
                     fontSize: '0.8rem',
                     fontWeight: '600',
                     boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
                   }}
                 >
                   <i className="fas fa-star me-2"></i>
                   Primary
                 </span>
               )}
              <button
                type="button"
                className="btn btn-outline-light rounded-circle close-btn"
                onClick={handleClose}
                style={{ 
                  width: '40px', 
                  height: '40px',
                  zIndex: 10002,
                  pointerEvents: 'auto'
                }}
                aria-label="Close"
              >
                <i className="fas fa-times fa-lg"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Image Container */}
        <div 
          className="position-relative d-flex align-items-center justify-content-center" 
          style={{ 
            minHeight: '80vh', 
            paddingTop: '100px', 
            paddingBottom: '140px',
            pointerEvents: 'none'
          }}
        >
                     {/* Main Image */}
           <div 
             ref={containerRef}
             className="position-relative image-container"
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
             onDoubleClick={handleDoubleClick}
             style={{ 
               cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
               pointerEvents: 'auto',
               userSelect: 'none',
               overflow: 'hidden'
             }}
           >
             <img
               ref={imageRef}
               src={imageUrl}
               alt={currentImage?.alt || `Image ${activeIndex + 1}`}
               className="img-fluid modal-image"
               draggable={false}
               style={{ 
                 maxHeight: '75vh', 
                 maxWidth: '85vw', 
                 objectFit: 'contain',
                 transition: imageLoading ? 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                 opacity: imageLoading ? 0 : 1,
                 borderRadius: '16px',
                 transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
                 transformOrigin: 'center center',
                 willChange: 'transform'
               }}
               onLoad={() => setImageLoading(false)}
               onError={(e) => {
                 e.target.style.display = 'none';
                 e.target.nextSibling.style.display = 'flex';
                 setImageLoading(false);
               }}
             />
            {imageLoading && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <div className="spinner-border text-light" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            <div 
              className="d-none align-items-center justify-content-center text-white position-absolute top-50 start-50 translate-middle"
              style={{ minHeight: '50vh' }}
            >
              <div className="text-center">
                <i className="fas fa-image fa-4x mb-4 text-white-50"></i>
                <h5 className="text-white-50">Image not available</h5>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                className="btn btn-outline-light rounded-circle nav-btn prev"
                onClick={handlePrevious}
                style={{ 
                  position: 'fixed',
                  top: '50%',
                  left: '30px',
                  transform: 'translateY(-50%)',
                  width: '60px', 
                  height: '60px',
                  zIndex: 10002,
                  pointerEvents: 'auto'
                }}
                aria-label="Previous image"
              >
                <i className="fas fa-chevron-left fa-lg"></i>
              </button>
              <button
                className="btn btn-outline-light rounded-circle nav-btn next"
                onClick={handleNext}
                style={{ 
                  position: 'fixed',
                  top: '50%',
                  right: '30px',
                  transform: 'translateY(-50%)',
                  width: '60px', 
                  height: '60px',
                  zIndex: 10002,
                  pointerEvents: 'auto'
                }}
                aria-label="Next image"
              >
                <i className="fas fa-chevron-right fa-lg"></i>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail navigation */}
        {images.length > 1 && (
          <div 
            className="thumbnail-container" 
            style={{ 
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10001,
              pointerEvents: 'auto',
              padding: '16px'
            }}
          >
                         <div className="d-flex justify-content-center gap-3 flex-wrap">
               {sortedImages.map((image, index) => (
                 <button
                   key={index}
                   className={`btn p-0 rounded-3 thumbnail-btn ${
                     index === displayIndex ? 'active' : ''
                   }`}
                   onClick={(e) => handleThumbnailClick(index, e)}
                   style={{ 
                     width: '60px', 
                     height: '60px', 
                     overflow: 'hidden',
                     zIndex: 10002,
                     pointerEvents: 'auto',
                     position: 'relative'
                   }}
                   aria-label={`View image ${index + 1}`}
                 >
                   <img
                     src={getImageUrl(image, type)}
                     alt={`Thumbnail ${index + 1}`}
                     className="img-fluid"
                     style={{ 
                       width: '100%', 
                       height: '100%', 
                       objectFit: 'cover',
                       borderRadius: '12px'
                     }}
                   />
                   {image.isPrimary && (
                     <div 
                       className="position-absolute top-0 end-0 m-1"
                       style={{
                         width: '20px',
                         height: '20px',
                         backgroundColor: '#ffd700',
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         fontSize: '10px',
                         color: '#000',
                         fontWeight: 'bold'
                       }}
                     >
                       ★
                     </div>
                   )}
                 </button>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;

