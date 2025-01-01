package app

import (
    "bytes"
    "encoding/base64"
    "fmt"
    "mime/multipart"
    "net/smtp"
    "net/textproto"
    "strings"
    "time"

    "github.com/wailsapp/wails/v2/pkg/runtime"
)

// SendEmail sends an email with the provided data using stored credentials
func (a *App) SendEmail(data EmailData) error {
    a.mu.RLock()
    creds := a.emailCredentials
    a.mu.RUnlock()

    if creds == nil {
        return fmt.Errorf("no email credentials configured")
    }

    // Create email message
    message, err := createEmailMessage(data, *creds)
    if err != nil {
        return fmt.Errorf("failed to create email message: %w", err)
    }

    // Prepare authentication
    auth := smtp.PlainAuth("", creds.EmailAddress, creds.Password, creds.SMTPHost)
    addr := fmt.Sprintf("%s:%s", creds.SMTPHost, creds.SMTPPort)

    // Send the email
    err = smtp.SendMail(
        addr,
        auth,
        creds.EmailAddress,
        []string{data.To},
        message,
    )

    if err != nil {
        runtime.LogError(a.ctx, fmt.Sprintf("Failed to send email: %v", err))
        // Record failed attempt
        a.AddSentEmail(SentEmail{
            To:        data.To,
            Subject:   data.Subject,
            Timestamp: time.Now().UTC(),
            Status:    "Failed",
        })
        return fmt.Errorf("failed to send email: %w", err)
    }

    // Record successful send
    a.AddSentEmail(SentEmail{
        To:        data.To,
        Subject:   data.Subject,
        Timestamp: time.Now().UTC(),
        Status:    "Sent",
    })

    runtime.LogInfo(a.ctx, fmt.Sprintf("Email sent successfully to %s", data.To))
    return nil
}

// createEmailMessage creates a MIME message with attachments using multipart writer
func createEmailMessage(data EmailData, creds EmailCredentials) ([]byte, error) {
    buf := new(bytes.Buffer)
    writer := multipart.NewWriter(buf)

    // Write email headers
    headers := textproto.MIMEHeader{}
    headers.Set("From", creds.EmailAddress)
    headers.Set("To", data.To)
    headers.Set("Subject", data.Subject)
    headers.Set("MIME-Version", "1.0")
    headers.Set("Date", time.Now().UTC().Format(time.RFC1123Z))
    headers.Set("Content-Type", fmt.Sprintf("multipart/mixed; boundary=%s", writer.Boundary()))

    for key, values := range headers {
        for _, value := range values {
            fmt.Fprintf(buf, "%s: %s\r\n", key, value)
        }
    }
    buf.WriteString("\r\n")

    // Create the text part
    textPart, err := writer.CreatePart(textproto.MIMEHeader{
        "Content-Type":              {"text/plain; charset=utf-8"},
        "Content-Transfer-Encoding": {"quoted-printable"},
    })
    if err != nil {
        return nil, fmt.Errorf("failed to create text part: %w", err)
    }
    _, err = textPart.Write([]byte(data.Body))
    if err != nil {
        return nil, fmt.Errorf("failed to write text part: %w", err)
    }

    // Add attachments
    for _, attachment := range data.Attachments {
        attachmentPart, err := writer.CreatePart(textproto.MIMEHeader{
            "Content-Type":              {"application/octet-stream"},
            "Content-Transfer-Encoding": {"base64"},
            "Content-Disposition":       {fmt.Sprintf(`attachment; filename="%s"`, attachment.Name)},
        })
        if err != nil {
            return nil, fmt.Errorf("failed to create attachment part: %w", err)
        }

        // Decode base64 content
        decoded, err := base64.StdEncoding.DecodeString(attachment.Content)
        if err != nil {
            return nil, fmt.Errorf("failed to decode attachment content: %w", err)
        }

        // Encode in base64 with proper line breaks
        encoded := base64.StdEncoding.EncodeToString(decoded)
        // Write in chunks of 76 characters
        for len(encoded) > 76 {
            _, err = attachmentPart.Write([]byte(encoded[:76] + "\r\n"))
            if err != nil {
                return nil, fmt.Errorf("failed to write attachment content: %w", err)
            }
            encoded = encoded[76:]
        }
        if len(encoded) > 0 {
            _, err = attachmentPart.Write([]byte(encoded + "\r\n"))
            if err != nil {
                return nil, fmt.Errorf("failed to write final attachment content: %w", err)
            }
        }
    }

    err = writer.Close()
    if err != nil {
        return nil, fmt.Errorf("failed to close multipart writer: %w", err)
    }

    return buf.Bytes(), nil
}

// ValidateEmailAddress performs basic validation of an email address
func ValidateEmailAddress(email string) error {
    if email == "" {
        return fmt.Errorf("email address cannot be empty")
    }
    if !strings.Contains(email, "@") {
        return fmt.Errorf("invalid email address format")
    }
    parts := strings.Split(email, "@")
    if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
        return fmt.Errorf("invalid email address format")
    }
    if !strings.Contains(parts[1], ".") {
        return fmt.Errorf("invalid domain in email address")
    }
    return nil
}

// BatchSendEmail sends the same email to multiple recipients
func (a *App) BatchSendEmail(data EmailData, recipients []string) map[string]error {
    results := make(map[string]error)

    for _, recipient := range recipients {
        emailData := data
        emailData.To = recipient
        err := a.SendEmail(emailData)
        results[recipient] = err
    }

    return results
}

// GetEmailStats returns statistics about sent emails
func (a *App) GetEmailStats() map[string]interface{} {
    a.mu.RLock()
    defer a.mu.RUnlock()

    stats := map[string]interface{}{
        "total":      len(a.sentEmails),
        "success":    0,
        "failed":     0,
        "lastSent":   nil,
        "recipients": make(map[string]int),
    }

    for _, email := range a.sentEmails {
        if email.Status == "Sent" {
            stats["success"] = stats["success"].(int) + 1
        } else {
            stats["failed"] = stats["failed"].(int) + 1
        }

        // Track recipient frequency
        stats["recipients"].(map[string]int)[email.To]++

        // Track most recent email
        if stats["lastSent"] == nil || email.Timestamp.After(stats["lastSent"].(time.Time)) {
            stats["lastSent"] = email.Timestamp
        }
    }

    return stats
}

// ClearEmailHistory clears the sent email history
func (a *App) ClearEmailHistory() {
    a.mu.Lock()
    defer a.mu.Unlock()
    a.sentEmails = make([]SentEmail, 0)
}

// SearchEmails searches through sent emails based on criteria
func (a *App) SearchEmails(query string) []SentEmail {
    a.mu.RLock()
    defer a.mu.RUnlock()

    if query == "" {
        return a.sentEmails
    }

    query = strings.ToLower(query)
    var results []SentEmail

    for _, email := range a.sentEmails {
        if strings.Contains(strings.ToLower(email.To), query) ||
            strings.Contains(strings.ToLower(email.Subject), query) {
            results = append(results, email)
        }
    }

    return results
}