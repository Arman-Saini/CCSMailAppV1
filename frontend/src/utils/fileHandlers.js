// frontend/src/utils/fileHandlers.js

/**
 * Utility functions for file handling operations
 * Created by: Arman-Saini
 * Created on: 2025-01-01
 */

/**
 * Maximum file size in bytes (25MB)
 * @constant {number}
 */
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

/**
 * Allowed file types and their corresponding MIME types
 * @constant {Object}
 */
export const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt',
  'application/zip': '.zip'
};

/**
 * Validates a single file
 * @param {File} file - File to validate
 * @returns {Object} Validation result with status and error message if any
 */
export const validateFile = (file) => {
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES[file.type]) {
    return {
      isValid: false,
      error: 'File type not supported'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validates multiple files
 * @param {File[]} files - Array of files to validate
 * @returns {Object} Validation results for all files
 */
export const validateFiles = (files) => {
  const results = {
    isValid: true,
    errors: [],
    validFiles: [],
    invalidFiles: []
  };

  if (!files || !files.length) {
    return {
      ...results,
      isValid: false,
      errors: ['No files provided']
    };
  }

  files.forEach(file => {
    const validation = validateFile(file);
    if (validation.isValid) {
      results.validFiles.push(file);
    } else {
      results.isValid = false;
      results.errors.push(`${file.name}: ${validation.error}`);
      results.invalidFiles.push({
        file,
        error: validation.error
      });
    }
  });

  return results;
};

/**
 * Formats file size into human-readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Gets file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Checks if file type is an image
 * @param {string} mimeType - MIME type of the file
 * @returns {boolean} True if file is an image
 */
export const isImageFile = (mimeType) => {
  return mimeType.startsWith('image/');
};

/**
 * Creates a preview URL for a file
 * @param {File} file - File to create preview for
 * @returns {Promise<string>} Preview URL
 */
export const createFilePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (isImageFile(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    } else {
      resolve(null);
    }
  });
};

/**
 * Converts file size to appropriate unit
 * @param {number} bytes - File size in bytes
 * @returns {Object} Size with appropriate unit
 */
export const convertFileSize = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return {
    value: size.toFixed(2),
    unit: units[unitIndex]
  };
};

/**
 * Handles file drop event
 * @param {DragEvent} event - Drop event
 * @returns {File[]} Array of dropped files
 */
export const handleFileDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const items = event.dataTransfer.items;
  const files = [];

  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        files.push(item.getAsFile());
      }
    }
  }

  return files;
};

/**
 * Gets safe filename for download
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
export const getSafeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

export default {
  validateFile,
  validateFiles,
  formatFileSize,
  getFileExtension,
  isImageFile,
  createFilePreview,
  convertFileSize,
  handleFileDrop,
  getSafeFilename,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
};