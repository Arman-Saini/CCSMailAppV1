// frontend/src/components/SentMails.jsx
import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import StatusMessage from './StatusMessage';
import '../styles/components/SentMails.css';

const SentMails = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sentEmails, setSentEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchSentEmails();
  }, []);

  const fetchSentEmails = async () => {
    try {
      setIsLoading(true);
      // Using Wails backend function
      const emails = await window.go.main.App.GetSentEmails();
      setSentEmails(emails.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)));
      setStatusMessage(null);
    } catch (error) {
      console.error('Error fetching sent emails:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to load sent emails. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAttachmentSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleEmailDetails = (emailId) => {
    setSelectedEmail(selectedEmail === emailId ? null : emailId);
  };

  if (isLoading) {
    return (
      <div className="sent-mails-loading">
        <LoadingSpinner />
        <p>Loading sent emails...</p>
      </div>
    );
  }

  return (
    <div className="sent-mails-container">
      <div className="sent-mails-header">
        <h2>Sent Emails</h2>
        <button 
          onClick={fetchSentEmails} 
          className="refresh-button"
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>

      {statusMessage && (
        <StatusMessage 
          type={statusMessage.type}
          message={statusMessage.message}
        />
      )}

      {sentEmails.length === 0 ? (
        <div className="no-emails">
          <p>No emails sent yet</p>
        </div>
      ) : (
        <div className="emails-list">
          {sentEmails.map((email) => (
            <div 
              key={email.id} 
              className={`email-item ${selectedEmail === email.id ? 'selected' : ''}`}
            >
              <div 
                className="email-summary"
                onClick={() => toggleEmailDetails(email.id)}
              >
                <div className="email-header">
                  <span className="email-to">{email.to}</span>
                  <span className="email-date">{formatDateTime(email.sentAt)}</span>
                </div>
                <div className="email-subject">{email.subject}</div>
              </div>

              {selectedEmail === email.id && (
                <div className="email-details">
                  <div className="email-body">
                    {email.body}
                  </div>
                  
                  {email.attachments && email.attachments.length > 0 && (
                    <div className="email-attachments">
                      <h4>Attachments:</h4>
                      <ul>
                        {email.attachments.map((attachment, index) => (
                          <li key={index} className="attachment-item">
                            <span className="attachment-name">{attachment.name}</span>
                            <span className="attachment-size">
                              ({formatAttachmentSize(attachment.size)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {email.status && (
                    <div className={`email-status ${email.status.toLowerCase()}`}>
                      Status: {email.status}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SentMails;