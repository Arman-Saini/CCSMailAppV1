// frontend/src/components/LoadingSpinner.jsx
import React from 'react';
import '../styles/components/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = '#007bff' }) => {
  const spinnerSize = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  const spinnerStyle = {
    width: spinnerSize[size] || spinnerSize.medium,
    height: spinnerSize[size] || spinnerSize.medium,
    borderColor: `${color} transparent transparent transparent`
  };

  return (
    <div className="loading-spinner-container">
      <div 
        className="loading-spinner" 
        style={spinnerStyle}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;