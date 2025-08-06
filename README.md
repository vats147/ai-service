# 🤖 AI Agent Desktop

A native cross-platform desktop application for AI-powered task automation, built with Electron.js and integrated with Python-based automation engines.

![AI Agent Desktop](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![License](https://img.shields.io/badge/License-MIT-orange)

## ✨ Features

### 🖥️ **Native Desktop Experience**
- **Cross-platform**: Runs natively on Windows, macOS, and Linux
- **System Integration**: System tray, native notifications, file access
- **Modern UI**: Beautiful, responsive interface with dark/light mode support
- **Keyboard Shortcuts**: Full keyboard navigation and shortcuts

### 🤖 **AI-Powered Automation**
- **Task Automation**: Automate repetitive computer tasks
- **Web Browsing**: Automated web interaction and data extraction
- **File Operations**: Smart file management and organization
- **Screenshot Analysis**: AI-powered screen analysis and interaction
- **Terminal Integration**: Execute and manage terminal commands

### 🔄 **Real-time Communication**
- **Python Backend**: Seamless integration with existing Python AI engines
- **Socket.IO**: Real-time bidirectional communication
- **Live Updates**: Task progress and status updates
- **Error Handling**: Robust error reporting and recovery

### 📦 **Easy Distribution**
- **Native Installers**: DMG for macOS, MSI for Windows, AppImage for Linux
- **Auto-updates**: Seamless application updates
- **Code Signing**: Trusted installation across platforms

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+ with the AI Agent backend
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AI-app-electron
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Start Python backend** (in separate terminal)
   ```bash
   cd ../  # Go to main Agentic-AI directory
   python3 web_ui.py  # or your preferred backend script
   ```

### Building for Production

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build-mac     # macOS DMG
npm run build-win     # Windows NSIS installer  
npm run build-linux   # Linux AppImage

# Build for all platforms
npm run dist
```

## 🏗️ Architecture

```
AI Agent Desktop
├── src/
│   ├── main.js              # Main Electron process
│   └── renderer/            # Renderer process (UI)
│       ├── index.html       # Main HTML structure
│       ├── styles.css       # Modern CSS styling
│       └── renderer.js      # Frontend JavaScript logic
├── assets/                  # Application assets (icons, images)
├── dist/                    # Built applications (after build)
└── package.json             # Dependencies and scripts
```

### Communication Flow
```
Desktop App (Electron) ↔ Socket.IO ↔ Python Backend ↔ AI Engines
```

## 🎯 Usage

### Quick Actions
- **📸 Take Screenshot**: Capture and analyze screen content
- **🌐 Open Browser**: Launch web automation tasks
- **💻 Terminal Command**: Execute system commands
- **📁 File Operations**: Manage files and directories
- **⚙️ Run Workflow**: Execute complex automation sequences

### Chat Interface
- Type natural language commands
- Get real-time responses and task execution
- View task progress and results
- Export conversation history

### System Integration
- **Minimize to Tray**: Keep running in background
- **Native Notifications**: Get task completion alerts
- **File System Access**: Full access to local files
- **Cross-platform**: Consistent experience across OS

## ⚙️ Configuration

### Settings Panel
- **Auto-start**: Launch with system startup
- **Notifications**: Enable/disable task notifications  
- **Minimize to Tray**: Control window behavior
- **Backend URL**: Configure Python backend connection

### Environment Variables
```bash
# Optional configuration
AI_BACKEND_URL=http://localhost:5001  # Python backend URL
AI_LOG_LEVEL=info                     # Logging level
AI_AUTO_START=true                    # Auto-start with system
```

## 🔧 Development

### Project Structure
- **Main Process**: Handles app lifecycle, system integration
- **Renderer Process**: UI logic and user interactions
- **IPC Communication**: Secure communication between processes
- **Python Integration**: Real-time backend communication

### Development Commands
```bash
npm run start    # Start in production mode
npm run dev      # Start in development mode with live reload
npm run test     # Run test suite (when implemented)
npm run lint     # Code linting and formatting
```

### Adding Features
1. **Backend Integration**: Extend Python communication in `renderer.js`
2. **UI Components**: Add new interface elements in `index.html` and `styles.css`
3. **Quick Actions**: Add new automation shortcuts
4. **Settings**: Extend configuration options

## 🐛 Troubleshooting

### Common Issues

**App won't start**
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check for Python backend on port 5001

**Backend connection failed**
- Verify Python backend is running on localhost:5001
- Check firewall settings
- Review backend logs for errors

**Build failures**
- Ensure all dependencies are installed
- Check platform-specific build requirements
- Review electron-builder configuration

### Debug Mode
```bash
# Enable debug logging
DEBUG=electron* npm run dev

# Open developer tools automatically
npm run dev -- --dev-tools
```

## 📋 Roadmap

### v1.1.0
- [ ] Voice input support
- [ ] Plugin system for custom automations
- [ ] Cloud synchronization
- [ ] Advanced workflow builder

### v1.2.0
- [ ] Multi-language support
- [ ] Theme customization
- [ ] Performance monitoring
- [ ] Advanced analytics

### v2.0.0
- [ ] Mobile companion app
- [ ] Team collaboration features
- [ ] Enterprise deployment options
- [ ] Advanced AI model integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Electron.js** - Cross-platform desktop app framework
- **Socket.IO** - Real-time communication
- **Python Community** - AI and automation libraries
- **Contributors** - Everyone who helps improve this project

## 📞 Support

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: support@aiagent.dev
- **Documentation**: [Wiki](../../wiki)

---

<div align="center">
  <strong>Made with ❤️ for the automation community</strong>
</div>
