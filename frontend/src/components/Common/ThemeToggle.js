import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-outline-secondary theme-toggle ${className}`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
      <span className="ms-2 d-none d-md-inline">
        {isDark ? 'Light' : 'Dark'} Mode
      </span>
    </button>
  );
};

export default ThemeToggle;