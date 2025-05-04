# Article Paper Format Chrome Extension

This Chrome extension automatically reformats article pages to look like a clean, paper-like document while moving advertisements to the side or bottom of the page. It's designed to provide a better reading experience while still maintaining access to the page's advertisements.

## Features

- Automatically detects article pages
- Reformats content into a clean, paper-like layout
- Moves advertisements to a separate container
- Responsive design that works on all screen sizes
- Leaves media-centric pages (YouTube, Netflix, etc.) unchanged
- Print-friendly formatting

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and active

## How It Works

The extension automatically detects when you're viewing an article page by looking for common article indicators and content length. When an article is detected, it:

1. Reformats the main content into a paper-like layout
2. Moves advertisements to a fixed sidebar (or bottom on mobile devices)
3. Applies clean typography and spacing
4. Maintains all original content and functionality

The extension will not modify pages from media-centric sites like YouTube, Netflix, etc.

## Development

The extension consists of three main files:

- `manifest.json`: Extension configuration
- `content.js`: Page detection and transformation logic
- `styles.css`: Paper format styling

## License

MIT License - Feel free to modify and use this extension as you like. 