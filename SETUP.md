# AI Agent Desktop - Setup Guide

## Quick Start

1. **Get your Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Configure API Keys**
   - Open the `.env` file in the project root
   - Replace `your_gemini_api_key_here` with your actual Gemini API key
   - Save the file

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Application**
   ```bash
   npm start
   ```

## Features

### 🤖 AI-Powered Task Analysis
- Uses Google Gemini AI to understand complex commands
- Creates intelligent step-by-step automation workflows
- Fallback to rule-based analysis if AI is unavailable

### 🔧 Real Automation Capabilities
- **Screenshot Capture**: Takes screenshots to verify task completion
- **Browser Automation**: Opens websites and interacts with web pages
- **File Operations**: Lists files, creates directories, manages file system
- **Terminal Commands**: Executes system commands with output capture
- **Progress Tracking**: Real-time progress updates with retry logic

### 🖥️ Native Desktop Experience
- Cross-platform (Windows, macOS, Linux)
- System tray integration
- Native window management
- Keyboard shortcuts

## Example Commands

Try these commands once the app is running:

- **"Open YouTube in browser"** - Opens YouTube and verifies it loaded
- **"Take a screenshot"** - Captures current screen
- **"List files in current folder"** - Shows directory contents
- **"Open Google and search for AI news"** - Complex web automation

## Configuration Options

### Environment Variables (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes (for AI) |
| `MCP_ENABLED` | Enable Model Context Protocol | No |
| `MCP_PORT` | Port for MCP service | No |
| `NODE_ENV` | Development/production mode | No |
| `DEBUG` | Enable debug logging | No |

## Troubleshooting

### AI Features Not Working
- Check that `GEMINI_API_KEY` is set correctly in `.env`
- Verify your API key is valid at [Google AI Studio](https://aistudio.google.com/)
- The app will fall back to rule-based automation if AI fails

### App Won't Start
- Run `npm install` to ensure all dependencies are installed
- Check console for error messages
- Ensure you're using Node.js 16 or later

### Automation Not Working
- Grant necessary permissions (screen recording, accessibility) on macOS
- Check console logs for detailed error messages
- Some automation features require elevated permissions

## Development

### Project Structure
```
src/
├── main.js           # Main Electron process & TaskExecutionEngine
├── ai-service.js     # Gemini AI integration
├── mcp-service.js    # Model Context Protocol integration
└── renderer/         # UI files (HTML, CSS, JS)
```

### Building for Distribution
```bash
npm run build
```

This creates platform-specific installers in the `dist/` directory.

## Security Notes

- API keys are stored locally in `.env` (never committed to git)
- All automation runs with your user permissions
- Screenshots are saved locally in the `screenshots/` folder
- No data is sent to external services except Google AI API

## Support

If you encounter issues:
1. Check the console logs for error details
2. Verify your API key configuration
3. Ensure all dependencies are installed
4. Try running in development mode with `DEBUG=true`
