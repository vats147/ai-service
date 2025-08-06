<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Agent Desktop - Copilot Instructions

## Project Overview
This is an Electron.js desktop application for AI-powered task automation. The app provides a native cross-platform interface for interacting with Python-based AI automation engines.

## Architecture
- **Main Process**: `src/main.js` - Handles app lifecycle, window management, system integration
- **Renderer Process**: `src/renderer/` - Contains the UI (HTML, CSS, JS)
- **Python Backend**: Communicates with existing Python AI engines via Socket.IO
- **Build System**: Uses electron-builder for packaging native installers

## Key Technologies
- Electron.js for cross-platform desktop app framework
- Socket.IO for real-time communication with Python backend
- Modern CSS with CSS Grid/Flexbox for responsive UI
- Node.js APIs for system integration

## Development Guidelines

### Code Style
- Use modern JavaScript (ES6+) features
- Follow Electron security best practices
- Implement proper error handling and logging
- Use async/await for asynchronous operations

### UI/UX Patterns
- Native desktop app feel with modern web technologies
- Responsive design that works on different screen sizes
- Proper keyboard shortcuts and accessibility
- System integration (tray, notifications, file handling)

### Security Considerations
- Disable node integration in renderer where possible
- Use context isolation for security
- Validate all data from Python backend
- Implement proper IPC communication patterns

### Integration Points
- Connect to Python backend on localhost:5001
- Handle Python process lifecycle
- Manage real-time communication with Socket.IO
- Provide native file system access

## Build and Distribution
- Use electron-builder for creating native installers
- Support Windows (NSIS), macOS (DMG), and Linux (AppImage)
- Implement auto-updater for seamless updates
- Code signing for trusted distribution

## Testing Considerations
- Test on all target platforms (Windows, macOS, Linux)
- Verify Python backend integration
- Test system integration features (tray, notifications)
- Performance testing for large-scale automation tasks
