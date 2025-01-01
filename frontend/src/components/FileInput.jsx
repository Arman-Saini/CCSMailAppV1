// frontend/src/components/FileInput.jsx
import React, { useRef, useState } from 'react';
import '../styles/components/FileInput.css';

const FileInput = ({ onFilesChange, files = [] }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Maximum file size (20MB)
  const MAX_FILE_SIZE = 20 * 1024 * 1024;

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File "${file.name}" exceeds 20MB size limit`);
    }
    return true;
  };

  const handleFiles = (newFiles) => {
    const validFiles = [];
    const errors = [];

    Array.from(newFiles).forEach(file => {
      try {
        if (validateFile(file)) {
          validFiles.push(file);
        }
      } catch (error) {
        errors.push(error.message);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const { files: droppedFiles } = e.dataTransfer;
    handleFiles(droppedFiles);
  };

  const removeFile = (indexToRemove) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="file-input-wrapper">
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          multiple
          className="file-input"
          accept="*/*"
        />
        <div className="drop-zone-content">
          <span className="upload-icon">📎</span>
          <p className="upload-text">
            {isDragging 
              ? 'Drop files here'
              : 'Click to select or drag files here'
            }
          </p>
          <span className="file-limit-text">Maximum file size: 20MB</span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h4>Selected Files:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="file-item">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="remove-file-btn"
                  aria-label={`Remove ${file.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileInput;