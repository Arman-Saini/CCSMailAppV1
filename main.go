package main

import (
	"embed"
	"log"
    "CCSMailAPPReactWails/app"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
)

//go:embed frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := app.NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "Email Client",
		Width:            1024,
		Height:           768,
		Assets:           assets,
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 1},
		OnStartup:        app.Startup,
		OnDomReady:       app.OnDomReady,
		OnShutdown:       app.OnShutdown,
		Bind: []interface{}{
			app,
		},
		// Remove the Debug field entirely if it's causing issues
		// Window options
		WindowStartState: options.Normal,
		Frameless:        false,
		MinWidth:         800,
		MinHeight:        600,
	})

	if err != nil {
		log.Fatal("Error:", err.Error())
	}
}
