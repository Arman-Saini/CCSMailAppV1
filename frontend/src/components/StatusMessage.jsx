// frontend/src/components/StatusMessage.jsx
import React, { useState, useEffect } from 'react';
import '../styles/components/StatusMessage.css';

const StatusMessage = ({ 
  type = 'info', 
  message, 
  duration = 5000, 
  onClose,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Reset states when message changes
    setIsVisible(true);
    setIsExiting(false);

    // Auto-dismiss if duration is provided and greater than 0
    if (duration > 0) {
      const timer = setTimeout(() => {
        startExit();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  const startExit = () => {
    setIsExiting(true);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Match this with CSS animation duration
  };

  const getStatusIcon = () => {
    switch (type.toLowerCase()) {
      case 'success':
        return (
          <span role="img" aria-label="success" className="status-icon">
            ✔
          </span>
        );
      case 'error':
        return (
          <span role="img" aria-label="error" className="status-icon">
            ✖
          </span>
        );
      case 'warning':
        return (
          <span role="img" aria-label="warning" className="status-icon">
            ⚠
          </span>
        );
      case 'info':
      default:
        return (
          <span role="img" aria-label="info" className="status-icon">
            ℹ
          </span>
        );
    }
  };

  if (!isVisible || !message) {
    return null;
  }

  return (
    <div 
      className={`status-message ${type} ${isExiting ? 'exit' : 'enter'} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="status-content">
        {getStatusIcon()}
        <span className="status-text">{message}</span>
      </div>
      
      <button 
        type="button" 
        className="close-button"
        onClick={startExit}
        aria-label="Close message"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
};

export default StatusMessage;