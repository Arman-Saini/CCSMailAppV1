// frontend/src/utils/validation.js

/**
 * Email validation regex pattern
 * @constant {RegExp}
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {Object} Validation result
 */
const validateEmail = (email) => {
  if (!email) {
    return {
      isValid: false,
      error: 'Email is required'
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validates subject
 * @param {string} subject - Email subject
 * @returns {Object} Validation result
 */
const validateSubject = (subject) => {
  if (!subject || subject.trim() === '') {
    return {
      isValid: false,
      error: 'Subject is required'
    };
  }

  if (subject.length > 200) {
    return {
      isValid: false,
      error: 'Subject cannot exceed 200 characters'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validates email body
 * @param {string} body - Email body content
 * @returns {Object} Validation result
 */
const validateBody = (body) => {
  if (!body || body.trim() === '') {
    return {
      isValid: false,
      error: 'Message body is required'
    };
  }

  if (body.length > 50000) {
    return {
      isValid: false,
      error: 'Message body cannot exceed 50000 characters'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validates attachments
 * @param {File[]} attachments - Array of file attachments
 * @returns {Object} Validation result
 */
const validateAttachments = (attachments) => {
  if (!attachments || !Array.isArray(attachments)) {
    return {
      isValid: true,
      error: null
    };
  }

  if (attachments.length > 10) {
    return {
      isValid: false,
      error: 'Maximum 10 files allowed'
    };
  }

  const totalSize = attachments.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > 25 * 1024 * 1024) { // 25MB limit
    return {
      isValid: false,
      error: 'Total attachment size cannot exceed 25MB'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

// Add the default export
const validation = {
  validateEmail,
  validateSubject,
  validateBody,
  validateAttachments,
  EMAIL_REGEX
};

export default validation;