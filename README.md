# Substack Notes Blocker

A Chrome extension that allows users to disable their Substack notes feed and turn off notification bells with simple toggle switches.

## Features

- **Block Notes Feed**: Hide the Substack notes feed from your browsing experience
- **Block Notifications**: Hide the notification bell icon and related notifications
- **Simple Toggle Interface**: Easy-to-use popup with toggle switches
- **Real-time Updates**: Changes apply immediately without page refresh (in most cases)
- **Persistent Settings**: Your preferences are saved and remembered across browser sessions

## Installation Instructions

### Method 1: Load as Unpacked Extension (Recommended for Development/Testing)

1. **Download the Extension Files**
   - Download all files from this repository to a local folder on your computer
   - Make sure you have all these files:
     - `manifest.json`
     - `popup.html`
     - `popup.js`
     - `content.js`
     - `content.css`
     - `background.js`
     - `icons/` folder with icon files

2. **Open Chrome Extension Management**
   - Open Google Chrome
   - Navigate to `chrome://extensions/` in your address bar
   - Or go to Chrome Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - In the top-right corner of the Extensions page, toggle on "Developer mode"

4. **Load the Extension**
   - Click "Load unpacked" button that appears after enabling Developer mode
   - Navigate to and select the folder containing the extension files
   - Click "Select Folder" (or "Open" on some systems)

5. **Verify Installation**
   - You should see "Substack Notes Blocker" appear in your extensions list
   - The extension icon should appear in your Chrome toolbar
   - If the icon doesn't appear in the toolbar, click the puzzle piece icon and pin the extension

### Method 2: Package and Install (For Distribution)

1. **Create Extension Package**
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Pack extension"
   - Select the extension folder
   - Click "Pack Extension"
   - This creates a `.crx` file

2. **Install the Package**
   - Drag and drop the `.crx` file onto the Chrome Extensions page
   - Click "Add Extension" when prompted

## Usage Instructions

1. **Navigate to Substack**
   - Go to any Substack website (e.g., `example.substack.com`)

2. **Open the Extension**
   - Click the Substack Notes Blocker icon in your Chrome toolbar
   - If you don't see the icon, click the puzzle piece icon and find it there

3. **Configure Settings**
   - **Block Notes Feed**: Toggle this on to hide the Substack notes feed
   - **Block Notifications**: Toggle this on to hide notification bells and badges

4. **Apply Changes**
   - Changes should apply immediately in most cases
   - If elements don't disappear immediately, refresh the page
   - Your settings are automatically saved

## How It Works

The extension uses several techniques to identify and hide Substack elements:

- **Content Scripts**: Automatically injected into Substack pages to modify the DOM
- **CSS Selectors**: Targets common Substack UI patterns for notes and notifications
- **Dynamic Detection**: Uses mutation observers to handle dynamically loaded content
- **Persistent Storage**: Saves your preferences using Chrome's storage API

## Troubleshooting

### Extension Not Working
- Make sure you're on a Substack website (`*.substack.com`)
- Try refreshing the page after changing settings
- Check that the extension is enabled in `chrome://extensions/`

### Elements Still Visible
- Substack may have updated their UI - the extension targets common selectors
- Try toggling the settings off and on again
- Refresh the page after making changes

### Extension Icon Missing
- Click the puzzle piece icon in Chrome toolbar
- Find "Substack Notes Blocker" and click the pin icon to keep it visible

### Settings Not Saving
- Make sure Chrome has permission to store data
- Try disabling and re-enabling the extension

## Technical Details

### Files Structure
```
substack-notes-blocker/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── content.js            # Main content script
├── content.css           # Additional CSS for hiding elements
├── background.js         # Background service worker
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Permissions
- `storage`: To save user preferences
- `activeTab`: To interact with the current Substack tab
- `*://*.substack.com/*`: To run on all Substack domains

### Browser Compatibility
- Chrome (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)

## Privacy

This extension:
- ✅ Only runs on Substack websites
- ✅ Stores settings locally on your device
- ✅ Does not collect or transmit any personal data
- ✅ Does not track your browsing activity
- ✅ Works completely offline

## Development

### Making Changes
1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes on a Substack site

### Adding New Selectors
If Substack changes their UI and elements aren't being hidden:
1. Open `content.js`
2. Add new selectors to the `SELECTORS` object
3. Reload the extension

## Contributing

Feel free to submit issues or pull requests if you find bugs or want to improve the extension.

## License

This project is open source and available under the MIT License.

## Changelog

### Version 1.0.0
- Initial release
- Block notes feed functionality
- Block notifications functionality
- Toggle interface with persistent settings
- Real-time updates without page refresh