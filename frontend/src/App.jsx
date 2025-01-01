import { useState } from 'react'
import EmailForm from './components/EmailForm'
import StatusMessage from './components/StatusMessage'
import SentMails from './components/SentMails'
import { useEmailState } from './hooks/useEmailState'
import emailService from './services/emailService'
import './App.css'

function App() {
  console.log("App Component rendering!")
  const [currentTime] = useState("2025-01-01 17:56:23");
  const [currentUser] = useState("Arman-Saini");
  const [isConfigured, setIsConfigured] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState({
    userEmail: '',
    password: '',
    smtpServer: '',
    smtpPort: '',
    useTLS: true
  });

  // Use the correct hook implementation
  const {
    emailState,
    updateField,
    handleAttachments,
    submitEmail,
    resetForm,
    isFormValid,
    validateEmail,
    handleDrop,
    removeAttachment
  } = useEmailState();

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const settingsErrors = {};

    // Validate email
    if (!validateEmail(smtpConfig.userEmail)) {
      settingsErrors.userEmail = 'Invalid email format';
    }

    // Validate SMTP server
    if (!smtpConfig.smtpServer) {
      settingsErrors.smtpServer = 'SMTP server is required';
    }

    // Validate port
    if (!smtpConfig.smtpPort) {
      settingsErrors.smtpPort = 'Port number is required';
    } else if (isNaN(smtpConfig.smtpPort) || smtpConfig.smtpPort < 1 || smtpConfig.smtpPort > 65535) {
      settingsErrors.smtpPort = 'Invalid port number';
    }

    // Validate password
    if (!smtpConfig.password) {
      settingsErrors.password = 'Password is required';
    }

    if (Object.keys(settingsErrors).length > 0) {
      // You might want to add state for settings errors
      console.error('Settings validation failed:', settingsErrors);
      return;
    }

    setIsConfigured(true);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConfigured) {
      updateField('error', 'Please configure your SMTP settings first');
      return;
    }

    if (!isFormValid()) {
      updateField('error', 'Please fill in all required fields');
      return;
    }

    try {
      await submitEmail();
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  return (
    <div className="app-container">
      <h1 style = {{color: "red"}}>TEST RENDER</h1>
      <div className="app-header">
        <h1>CCS Mail App</h1>
        <div className="user-info">
          <p>Current Date and Time (UTC): {currentTime}</p>
          <p>Current User's Login: {currentUser}</p>
          {isConfigured && (
            <>
              <p>Email: {smtpConfig.userEmail}</p>
              <p>SMTP Server: {smtpConfig.smtpServer}</p>
            </>
          )}
        </div>
      </div>

      {!isConfigured ? (
        <div className="settings-form-container">
          <h2>Email Configuration</h2>
          <p className="setup-message">Please configure your email settings to continue</p>
          
          <form onSubmit={handleSettingsSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="userEmail">Your Email Address:</label>
              <input
                type="email"
                id="userEmail"
                name="userEmail"
                value={smtpConfig.userEmail}
                onChange={(e) => setSmtpConfig({...smtpConfig, userEmail: e.target.value})}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Email Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={smtpConfig.password}
                onChange={(e) => setSmtpConfig({...smtpConfig, password: e.target.value})}
                placeholder="Your email password or app-specific password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="smtpServer">SMTP Server:</label>
              <input
                type="text"
                id="smtpServer"
                name="smtpServer"
                value={smtpConfig.smtpServer}
                onChange={(e) => setSmtpConfig({...smtpConfig, smtpServer: e.target.value})}
                placeholder="e.g., smtp.gmail.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="smtpPort">SMTP Port:</label>
              <input
                type="number"
                id="smtpPort"
                name="smtpPort"
                value={smtpConfig.smtpPort}
                onChange={(e) => setSmtpConfig({...smtpConfig, smtpPort: e.target.value})}
                placeholder="e.g., 587"
              />
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="useTLS"
                  checked={smtpConfig.useTLS}
                  onChange={(e) => setSmtpConfig({...smtpConfig, useTLS: e.target.checked})}
                />
                Use TLS (recommended)
              </label>
            </div>

            <div className="form-actions">
              <button type="submit">Save Configuration</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="app-content">
          <EmailForm 
            emailState={emailState}
            updateField={updateField}
            handleAttachments={handleAttachments}
            handleDrop={handleDrop}
            removeAttachment={removeAttachment}
            onSubmit={handleEmailSubmit}
            isFormValid={isFormValid}
          />
          {emailState.success && <StatusMessage message="Email sent successfully!" type="success" />}
          {emailState.error && <StatusMessage message={emailState.error} type="error" />}
        </div>
      )}
    </div>
  );
}

export default App;