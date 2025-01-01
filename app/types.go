package app

import (
    "fmt"
    "net/smtp"
    "time"
)

// EmailCredentials stores SMTP server configuration
type EmailCredentials struct {
    SMTPHost     string `json:"smtpHost"`
    SMTPPort     string `json:"smtpPort"`
    EmailAddress string `json:"emailAddress"`
    Password     string `json:"password"`
}

// EmailData represents the structure of an email to be sent
type EmailData struct {
    To          string     `json:"to"`
    Subject     string     `json:"subject"`
    Body        string     `json:"body"`
    Attachments []FileData `json:"attachments"`
}

// FileData represents an attachment
type FileData struct {
    Name    string `json:"name"`
    Content string `json:"content"` // Base64 encoded content
}

// SentEmail represents a record of a sent email
type SentEmail struct {
    To        string    `json:"to"`
    Subject   string    `json:"subject"`
    Timestamp time.Time `json:"timestamp"`
    Status    string    `json:"status"`
}

// Validate checks if the email credentials are valid
func (e *EmailCredentials) Validate() error {
    if e.SMTPHost == "" {
        return fmt.Errorf("SMTP host is required")
    }
    if e.SMTPPort == "" {
        return fmt.Errorf("SMTP port is required")
    }
    if e.EmailAddress == "" {
        return fmt.Errorf("email address is required")
    }
    if e.Password == "" {
        return fmt.Errorf("password is required")
    }
    return nil
}

// TestConnection tests the SMTP connection with the credentials
func (e *EmailCredentials) TestConnection() error {
    auth := smtp.PlainAuth("", e.EmailAddress, e.Password, e.SMTPHost)
    addr := fmt.Sprintf("%s:%s", e.SMTPHost, e.SMTPPort)

    // Try to connect to the SMTP server
    client, err := smtp.Dial(addr)
    if err != nil {
        return fmt.Errorf("failed to connect to SMTP server: %w", err)
    }
    defer client.Close()

    // Try to authenticate
    if err := client.Auth(auth); err != nil {
        return fmt.Errorf("authentication failed: %w", err)
    }

    return nil
}