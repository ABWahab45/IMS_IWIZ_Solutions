import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const DynamicLogo = ({ className = '', size = 'medium' }) => {
  const { theme } = useTheme();

  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  };

  const logoClass = `${sizeClasses[size]} font-bold ${className}`;

  if (theme === 'dark') {
    // Dark mode logo - IWIZ with stylized W
    return (
      <div className={`${logoClass} dynamic-logo`}>
        <div className="d-flex align-items-center">
          <span className="text-gray-400">I</span>
          <span className="stylized-w text-blue-500 fw-bold">W</span>
          <span className="text-gray-400">IZ</span>
        </div>
        <div className="text-blue-500 small fw-semibold">SOLUTIONS</div>
      </div>
    );
  } else {
    // Light mode logo - WiWiz with stylized W
    return (
      <div className={`${logoClass} dynamic-logo`}>
        <div className="d-flex align-items-center">
          <span className="text-gray-600">Wi</span>
          <span className="stylized-w text-blue-600 fw-bold">W</span>
          <span className="text-gray-600">iz</span>
        </div>
        <div className="text-blue-600 small fw-semibold">SOLUTIONS</div>
      </div>
    );
  }
};

export default DynamicLogo;
