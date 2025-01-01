// frontend/src/services/emailService.js

class EmailService {
  constructor() {
      // Don't try to access window.go.main.App immediately
      // Instead, we'll initialize it when needed
  }

  // Helper method to get the backend safely
  getBackend() {
      // Check if window.go exists and has the main.App
      if (!window.go?.main?.App) {
          throw new Error('Wails backend is not yet initialized');
      }
      return window.go.main.App;
  }

  async sendEmail({ to, subject, body, attachments = [] }) {
      try {
          // Get backend reference when needed
          const backend = this.getBackend();
          const response = await backend.SendEmail(to, subject, body, attachments);
          return {
              success: true,
              data: response,
              timestamp: new Date().toISOString()
          };
      } catch (error) {
          console.error('Error sending email:', error);
          throw {
              success: false,
              error: error.message || 'Failed to send email',
              timestamp: new Date().toISOString()
          };
      }
  }

  async getSentEmails(options = { limit: 50, offset: 0 }) {
      try {
          const backend = this.getBackend();
          const response = await backend.GetSentEmails();
          return {
              success: true,
              data: response,
              timestamp: new Date().toISOString()
          };
      } catch (error) {
          console.error('Error fetching sent emails:', error);
          throw {
              success: false,
              error: error.message || 'Failed to fetch sent emails',
              timestamp: new Date().toISOString()
          };
      }
  }

  validateEmailFormat(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  }

  validateAttachment(file, options = {
      maxSize: 25 * 1024 * 1024,
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif']
  }) {
      if (file.size > options.maxSize) {
          return {
              valid: false,
              error: `File size exceeds ${options.maxSize / (1024 * 1024)}MB limit`
          };
      }

      if (!options.allowedTypes.includes(file.type)) {
          return {
              valid: false,
              error: 'File type not supported'
          };
      }

      return { valid: true };
  }

  formatAttachmentSize(bytes) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;