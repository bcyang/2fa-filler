# 2FA Auto Filler Chrome Extension

A Chrome extension that automatically fills 2FA (Two-Factor Authentication) prompts using TOTP (Time-based One-Time Password) secrets. Currently supports Okta and Microsoft authentication.

## Features

- Automatically detects and fills 2FA prompts on supported websites
- Securely stores TOTP secrets in Chrome's sync storage
- Simple and intuitive user interface
- Supports multiple services
- Works with Okta and Microsoft authentication

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Add your TOTP secrets for each service you want to use:
   - Enter a service name (e.g., "Okta" or "Microsoft")
   - Enter your TOTP secret key
   - Click "Add Secret"
3. The extension will automatically detect and fill 2FA prompts when you visit supported websites

## Security Notes

- TOTP secrets are stored in Chrome's sync storage, which is encrypted
- The extension only runs on specified domains (Okta and Microsoft)
- No data is sent to external servers

## Supported Services

- Okta
- Microsoft (including Microsoft 365, Azure, etc.)

## Development

The extension is built using vanilla JavaScript and Chrome's extension APIs. The main components are:

- `manifest.json`: Extension configuration
- `popup.html/js`: User interface for managing secrets
- `background.js`: TOTP generation logic
- `content.js`: Page interaction and 2FA detection
- `styles.css`: UI styling

## License

MIT License 