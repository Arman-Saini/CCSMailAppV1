// frontend/src/hooks/useEmailState.js
import { useState, useCallback } from 'react';

export const useEmailState = () => {
  const [emailState, setEmailState] = useState({
    to: '',
    subject: '',
    body: '',
    attachments: [],
    isSubmitting: false,
    error: null,
    success: false
  });

  // Update form fields
  const updateField = useCallback((field, value) => {
    setEmailState(prev => ({
      ...prev,
      [field]: value,
      error: null // Clear error when field is updated
    }));
  }, []);

  // Handle file attachments
  const handleAttachments = useCallback((files) => {
    setEmailState(prev => ({
      ...prev,
      attachments: files,
      error: null
    }));
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setEmailState({
      to: '',
      subject: '',
      body: '',
      attachments: [],
      isSubmitting: false,
      error: null,
      success: false
    });
  }, []);

  // Submit email
  const submitEmail = useCallback(async () => {
    try {
      setEmailState(prev => ({
        ...prev,
        isSubmitting: true,
        error: null,
        success: false
      }));

      // Basic validation
      if (!emailState.to) {
        throw new Error('Recipient email is required');
      }

      if (!emailState.subject) {
        throw new Error('Subject is required');
      }

      if (!emailState.body) {
        throw new Error('Email body is required');
      }

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('to', emailState.to);
      formData.append('subject', emailState.subject);
      formData.append('body', emailState.body);
      
      // Append each attachment
      emailState.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      // Call Wails backend function
      const response = await window.go.main.App.SendEmail(
        emailState.to,
        emailState.subject,
        emailState.body,
        emailState.attachments
      );

      setEmailState(prev => ({
        ...prev,
        isSubmitting: false,
        success: true,
        error: null
      }));

      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
      }, 3000);

      return response;
    } catch (error) {
      setEmailState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error.message || 'Failed to send email',
        success: false
      }));
      throw error;
    }
  }, [emailState, resetForm]);

  // Validate email format
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    const { to, subject, body } = emailState;
    return to && validateEmail(to) && subject && body;
  }, [emailState, validateEmail]);

  // Handle drag and drop for attachments
  const handleDrop = useCallback((acceptedFiles) => {
    setEmailState(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...acceptedFiles],
      error: null
    }));
  }, []);

  // Remove attachment
  const removeAttachment = useCallback((index) => {
    setEmailState(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  }, []);

  return {
    emailState,
    updateField,
    handleAttachments,
    submitEmail,
    resetForm,
    isFormValid,
    validateEmail,
    handleDrop,
    removeAttachment
  };
};

export default useEmailState;