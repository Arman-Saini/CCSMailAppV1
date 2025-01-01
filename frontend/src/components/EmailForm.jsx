// frontend/src/components/EmailForm.jsx
import React, { useState, useCallback } from 'react';
import FileInput from './FileInput';
import LoadingSpinner from './LoadingSpinner';
import StatusMessage from './StatusMessage';
import { useEmailState } from '../hooks/useEmailState';
import validation from '../utils/validation';
import '../styles/components/EmailForm.css';

const EmailForm = () => {
  const { sendEmail, isLoading, statusMessage, setStatusMessage } = useEmailState();
  
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: '',
    attachments: []
  });

  const [errors, setErrors] = useState({
    to: '',
    subject: '',
    body: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = useCallback((files) => {
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  }, []);

  const validateForm = () => {
    // Using the validation functions from the imported validation utility
    const emailValidation = validation.validateEmail(formData.to);
    const subjectValidation = validation.validateSubject(formData.subject);
    const bodyValidation = validation.validateBody(formData.body);

    const newErrors = {
      to: emailValidation.isValid ? '' : emailValidation.error,
      subject: subjectValidation.isValid ? '' : subjectValidation.error,
      body: bodyValidation.isValid ? '' : bodyValidation.error
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatusMessage({
        type: 'error',
        message: 'Please fix the errors in the form'
      });
      return;
    }

    try {
      await sendEmail(formData);
      // Reset form on successful send
      setFormData({
        to: '',
        subject: '',
        body: '',
        attachments: []
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      to: '',
      subject: '',
      body: '',
      attachments: []
    });
    setErrors({
      to: '',
      subject: '',
      body: ''
    });
    setStatusMessage(null);
  };

  return (
    <div className="email-form-container">
      <form onSubmit={handleSubmit} className="email-form">
        <div className="form-group">
          <label htmlFor="to">To:</label>
          <input
            type="email"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            className={errors.to ? 'error' : ''}
            placeholder="recipient@example.com"
          />
          {errors.to && <span className="error-message">{errors.to}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className={errors.subject ? 'error' : ''}
            placeholder="Email subject"
          />
          {errors.subject && <span className="error-message">{errors.subject}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="body">Message:</label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            className={errors.body ? 'error' : ''}
            placeholder="Type your message here..."
            rows="6"
          />
          {errors.body && <span className="error-message">{errors.body}</span>}
        </div>

        <div className="form-group">
          <FileInput 
            onFilesChange={handleFileChange}
            files={formData.attachments}
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Send Email'}
          </button>
          <button 
            type="button" 
            className="reset-button"
            onClick={handleReset}
            disabled={isLoading}
          >
            Clear Form
          </button>
        </div>
      </form>

      {statusMessage && (
        <StatusMessage 
          type={statusMessage.type}
          message={statusMessage.message}
        />
      )}
    </div>
  );
};

export default EmailForm;