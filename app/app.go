package app

import (
    "context"
    "fmt"
    "sync"

    "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
    ctx              context.Context
    emailCredentials *EmailCredentials
    sentEmails      []SentEmail
    mu              sync.RWMutex // For thread-safe operations
}

// NewApp creates a new App application struct
func NewApp() *App {
    return &App{
        sentEmails: make([]SentEmail, 0),
    }
}

// Startup is called when the app starts. The context is saved,
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
    a.ctx = ctx
    runtime.LogInfo(ctx, "Application starting up...")
}

// OnDomReady is called after front-end resources have been loaded
func (a *App) OnDomReady(ctx context.Context) {
    runtime.LogInfo(ctx, "DOM Ready")
}

// OnShutdown is called when the app is closing
func (a *App) OnShutdown(ctx context.Context) {
    runtime.LogInfo(ctx, "Shutting down...")
}

// SaveEmailCredentials saves SMTP credentials
func (a *App) SaveEmailCredentials(creds EmailCredentials) error {
    a.mu.Lock()
    defer a.mu.Unlock()

    // Validate credentials before saving
    if err := creds.Validate(); err != nil {
        return fmt.Errorf("invalid credentials: %w", err)
    }

    a.emailCredentials = &creds
    return nil
}

// GetEmailCredentials returns the currently saved SMTP credentials
func (a *App) GetEmailCredentials() *EmailCredentials {
    a.mu.RLock()
    defer a.mu.RUnlock()
    return a.emailCredentials
}

// GetSentEmails returns the list of sent emails
func (a *App) GetSentEmails() []SentEmail {
    a.mu.RLock()
    defer a.mu.RUnlock()
    return a.sentEmails
}

// AddSentEmail adds a new email to the sent emails list
func (a *App) AddSentEmail(email SentEmail) {
    a.mu.Lock()
    defer a.mu.Unlock()
    a.sentEmails = append(a.sentEmails, email)
}

// ClearEmailCredentials clears the stored SMTP credentials
func (a *App) ClearEmailCredentials() {
    a.mu.Lock()
    defer a.mu.Unlock()
    a.emailCredentials = nil
}

// TestEmailConnection tests the SMTP connection with stored credentials
func (a *App) TestEmailConnection() error {
    a.mu.RLock()
    creds := a.emailCredentials
    a.mu.RUnlock()

    if creds == nil {
        return fmt.Errorf("no email credentials stored")
    }

    return creds.TestConnection()
}

// Greet returns a greeting for the frontend (useful for testing the connection)
func (a *App) Greet(name string) string {
    return fmt.Sprintf("Hello %s, welcome to the Email Client!", name)
}