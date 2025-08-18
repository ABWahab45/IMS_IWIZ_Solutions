import React from 'react';

const IwizLogo = ({ size = 'medium', className = '', showText = true }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-2xl';
      case 'medium':
        return 'text-3xl';
      case 'large':
        return 'text-4xl';
      case 'xl':
        return 'text-5xl';
      default:
        return 'text-3xl';
    }
  };

  return (
    <div className={`iwiz-logo ${getSizeClasses()} ${className}`}>
      <div className="logo-container d-flex align-items-center">
        <div className="logo-text">
          <span className="iwiz-text">IWIZ</span>
          {showText && <span className="solutions-text">SOLUTIONS</span>}
        </div>
        <div className="logo-graphic">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="lightning-bolt"
          >
            <path 
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" 
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default IwizLogo;
