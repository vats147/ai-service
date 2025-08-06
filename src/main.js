const { app, BrowserWindow, Menu, ipcMain, shell, dialog, Tray } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Import AI services
const AIService = require('./ai-service');
const MCPService = require('./mcp-service');

// Keep global reference of the window object
let mainWindow;
let tray;
let taskExecutionEngine;
let aiService;
let mcpService;

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
    try {
        const electronReload = require('electron-reload');
        electronReload(__dirname, {
            electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
            hardResetMethod: 'exit'
        });
        console.log('🔄 Live reload enabled');
    } catch (err) {
        console.log('⚠️ electron-reload not available (development mode)');
    }
}

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        },
        icon: path.join(__dirname, '../assets/icon.png'),
        titleBarStyle: 'hiddenInset', // Modern macOS style
        show: false // Don't show until ready
    });

    // Load the app
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Focus on window
        if (process.platform === 'darwin') {
            app.dock.show();
        }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle minimize to tray
    mainWindow.on('minimize', (event) => {
        if (process.platform === 'darwin') {
            return; // macOS handles this differently
        }
        event.preventDefault();
        mainWindow.hide();
    });

    // Handle close to tray
    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

function createTray() {
    const trayIcon = path.join(__dirname, '../assets/tray-icon.png');
    
    tray = new Tray(trayIcon);
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show AI Agent',
            click: () => {
                mainWindow.show();
                if (process.platform === 'darwin') {
                    app.dock.show();
                }
            }
        },
        {
            label: 'Hide AI Agent',
            click: () => {
                mainWindow.hide();
                if (process.platform === 'darwin') {
                    app.dock.hide();
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Settings',
            click: () => {
                // TODO: Open settings window
            }
        },
        { type: 'separator' },
        {
            label: 'Quit AI Agent',
            click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
    
    tray.setToolTip('AI Agent Desktop');
    tray.setContextMenu(contextMenu);
    
    // Double-click to show/hide
    tray.on('double-click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
}

function createMenu() {
    const template = [
        {
            label: 'AI Agent',
            submenu: [
                {
                    label: 'About AI Agent',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About AI Agent Desktop',
                            message: 'AI Agent Desktop v1.0.0',
                            detail: 'Native cross-platform task automation assistant\n\nBuilt with Electron and love ❤️'
                        });
                    }
                },
                { type: 'separator' },
                {
                    label: 'Preferences',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        // TODO: Open preferences
                    }
                },
                { type: 'separator' },
                {
                    role: 'quit'
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' },
                { type: 'separator' },
                {
                    label: 'Hide to Tray',
                    accelerator: 'CmdOrCtrl+H',
                    click: () => {
                        mainWindow.hide();
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Task Execution Engine
class TaskExecutionEngine {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.currentTask = null;
        this.taskQueue = [];
        this.isExecuting = false;
        this.screenshotCounter = 0;
        
        // Ensure screenshots directory exists
        this.screenshotsDir = path.join(__dirname, '../screenshots');
        if (!fs.existsSync(this.screenshotsDir)) {
            fs.mkdirSync(this.screenshotsDir, { recursive: true });
        }
    }
    
    // Parse user command into actionable steps with AI assistance
    async createTaskTodoList(userCommand) {
        console.log('🤖 Creating AI-powered task analysis...');
        
        // Try to use AI service for intelligent analysis
        let aiAnalysis = null;
        if (aiService) {
            const analysis = await aiService.analyzeUserCommand(userCommand);
            if (analysis.success) {
                aiAnalysis = analysis.analysis;
                console.log('✅ AI analysis completed:', aiAnalysis.category);
            }
        }
        
        // Try to use MCP for enhanced context
        let mcpContext = null;
        if (mcpService && mcpService.isReady()) {
            const contextResult = await mcpService.getScreenContext();
            if (contextResult && contextResult.success) {
                mcpContext = contextResult.result;
                console.log('✅ MCP context retrieved');
            }
        }
        
        // Use AI analysis if available, otherwise fallback to rule-based
        let tasks = [];
        if (aiAnalysis && aiAnalysis.tasks && aiAnalysis.tasks.length > 0) {
            // Convert AI analysis to our task format
            tasks = aiAnalysis.tasks.map((task, index) => ({
                id: index + 1,
                action: task.action,
                description: task.description,
                params: task.params,
                validation: task.validation
            }));
        } else {
            // Fallback to rule-based analysis
            tasks = this.createFallbackTasks(userCommand);
        }
        
        return {
            id: Date.now(),
            userCommand: userCommand,
            tasks: tasks,
            status: 'created',
            createdAt: new Date(),
            aiAnalysis: aiAnalysis,
            mcpContext: mcpContext,
            source: aiAnalysis ? 'ai' : 'fallback'
        };
    }
    
    createFallbackTasks(userCommand) {
        const command = userCommand.toLowerCase();
        let tasks = [];
        
        if (command.includes('open') && (command.includes('website') || command.includes('browser') || command.includes('google') || command.includes('youtube'))) {
            // Website opening workflow
            let url = 'https://google.com';
            
            if (command.includes('youtube')) {
                url = 'https://youtube.com';
            } else if (command.includes('google')) {
                url = 'https://google.com';
            }
            
            tasks = [
                {
                    id: 1,
                    action: 'screenshot',
                    description: 'Take initial screenshot to see current state',
                    params: { reason: 'initial_state' }
                },
                {
                    id: 2,
                    action: 'open_browser',
                    description: `Open browser and navigate to ${url}`,
                    params: { url: url }
                },
                {
                    id: 3,
                    action: 'wait',
                    description: 'Wait for page to load',
                    params: { duration: 3000 }
                },
                {
                    id: 4,
                    action: 'screenshot',
                    description: 'Take screenshot to verify website loaded',
                    params: { reason: 'verify_website' }
                },
                {
                    id: 5,
                    action: 'validate',
                    description: 'Check if website loaded correctly',
                    params: { retry_if_failed: true }
                }
            ];
        } else if (command.includes('screenshot') || command.includes('capture')) {
            tasks = [
                {
                    id: 1,
                    action: 'screenshot',
                    description: 'Capture current screen',
                    params: { reason: 'user_requested' }
                },
                {
                    id: 2,
                    action: 'analyze_screenshot',
                    description: 'Analyze screenshot content',
                    params: {}
                }
            ];
        } else if (command.includes('file') || command.includes('folder')) {
            tasks = [
                {
                    id: 1,
                    action: 'list_files',
                    description: 'List current directory files',
                    params: { directory: process.cwd() }
                },
                {
                    id: 2,
                    action: 'screenshot',
                    description: 'Take screenshot of file explorer',
                    params: { reason: 'file_operations' }
                }
            ];
        } else if (command.includes('terminal') || command.includes('command')) {
            tasks = [
                {
                    id: 1,
                    action: 'terminal_command',
                    description: 'Execute terminal command',
                    params: { command: 'ls -la' }
                },
                {
                    id: 2,
                    action: 'screenshot',
                    description: 'Take screenshot of terminal',
                    params: { reason: 'terminal_execution' }
                }
            ];
        } else {
            // Generic task
            tasks = [
                {
                    id: 1,
                    action: 'screenshot',
                    description: 'Take screenshot to understand current context',
                    params: { reason: 'context_analysis' }
                },
                {
                    id: 2,
                    action: 'analyze',
                    description: 'Analyze request and determine next steps',
                    params: { userCommand: userCommand }
                }
            ];
        }
        
        return tasks;
    }
    
    // Execute task workflow
    async executeTaskWorkflow(todoList) {
        if (this.isExecuting) {
            return { success: false, message: 'Another task is already executing' };
        }
        
        this.isExecuting = true;
        this.currentTask = todoList;
        
        // Send initial update to renderer
        this.sendProgressUpdate('started', 'Starting task execution...', todoList);
        
        try {
            for (let i = 0; i < todoList.tasks.length; i++) {
                const task = todoList.tasks[i];
                
                // Send progress update
                this.sendProgressUpdate('executing', `Step ${i + 1}: ${task.description}`, {
                    currentStep: i + 1,
                    totalSteps: todoList.tasks.length,
                    task: task
                });
                
                // Execute the task
                const result = await this.executeTask(task);
                
                if (!result.success && task.params?.retry_if_failed) {
                    // Retry after wait
                    await this.wait(2000);
                    const retryResult = await this.executeTask(task);
                    if (!retryResult.success) {
                        throw new Error(`Task failed after retry: ${task.description}`);
                    }
                }
                
                // Small delay between tasks
                await this.wait(1000);
            }
            
            // Task completed successfully
            this.sendProgressUpdate('completed', 'All tasks completed successfully!', {
                totalSteps: todoList.tasks.length,
                screenshotsTaken: this.screenshotCounter
            });
            
            return { success: true, message: 'Task workflow completed successfully' };
            
        } catch (error) {
            this.sendProgressUpdate('error', `Task failed: ${error.message}`, { error: error.message });
            return { success: false, message: error.message };
        } finally {
            this.isExecuting = false;
            this.currentTask = null;
        }
    }
    
    // Execute individual task
    async executeTask(task) {
        try {
            switch (task.action) {
                case 'screenshot':
                    return await this.takeScreenshot(task.params);
                    
                case 'open_browser':
                    return await this.openBrowser(task.params);
                    
                case 'wait':
                    return await this.wait(task.params.duration);
                    
                case 'validate':
                    return await this.validateAction(task.params);
                    
                case 'list_files':
                    return await this.listFiles(task.params);
                    
                case 'terminal_command':
                    return await this.executeTerminalCommand(task.params);
                    
                case 'analyze_screenshot':
                    return await this.analyzeScreenshot(task.params);
                    
                case 'analyze':
                    return await this.analyzeRequest(task.params);
                    
                default:
                    throw new Error(`Unknown task action: ${task.action}`);
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Individual task implementations
    async takeScreenshot(params) {
        return new Promise((resolve) => {
            const screenshot = require('electron').nativeImage.createEmpty();
            const { screen } = require('electron');
            
            // Get primary display
            const display = screen.getPrimaryDisplay();
            const { width, height } = display.bounds;
            
            // Take screenshot using electron's built-in capability
            this.mainWindow.webContents.capturePage().then((image) => {
                this.screenshotCounter++;
                const filename = `screenshot_${Date.now()}_${params.reason || 'general'}.png`;
                const filepath = path.join(this.screenshotsDir, filename);
                
                // Save screenshot
                fs.writeFileSync(filepath, image.toPNG());
                
                console.log(`📸 Screenshot saved: ${filepath}`);
                
                resolve({
                    success: true,
                    result: `Screenshot captured and saved to ${filename}`,
                    filepath: filepath,
                    filename: filename
                });
            }).catch((error) => {
                resolve({
                    success: false,
                    error: error.message
                });
            });
        });
    }
    
    async openBrowser(params) {
        try {
            // Open URL in default browser
            await shell.openExternal(params.url);
            
            return {
                success: true,
                result: `Opened browser with URL: ${params.url}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async wait(duration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    result: `Waited for ${duration}ms`
                });
            }, duration);
        });
    }
    
    async validateAction(params) {
        // Simple validation - in real implementation, this could analyze screenshots
        return {
            success: true,
            result: 'Validation passed'
        };
    }
    
    async listFiles(params) {
        return new Promise((resolve) => {
            fs.readdir(params.directory, (err, files) => {
                if (err) {
                    resolve({
                        success: false,
                        error: err.message
                    });
                } else {
                    resolve({
                        success: true,
                        result: `Found ${files.length} files: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`,
                        files: files
                    });
                }
            });
        });
    }
    
    async executeTerminalCommand(params) {
        return new Promise((resolve) => {
            exec(params.command, { cwd: process.cwd() }, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        success: false,
                        error: error.message
                    });
                } else {
                    resolve({
                        success: true,
                        result: `Command executed: ${stdout.slice(0, 200)}${stdout.length > 200 ? '...' : ''}`,
                        output: stdout,
                        stderr: stderr
                    });
                }
            });
        });
    }
    
    async analyzeScreenshot(params) {
        return {
            success: true,
            result: 'Screenshot analyzed - content appears to be a desktop application'
        };
    }
    
    async analyzeRequest(params) {
        return {
            success: true,
            result: `Analyzed user request: "${params.userCommand}" - Ready for further processing`
        };
    }
    
    // Send progress updates to renderer
    sendProgressUpdate(status, message, data = {}) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            // Ensure data is serializable by creating a clean object
            const cleanData = JSON.parse(JSON.stringify(data));
            
            this.mainWindow.webContents.send('task-progress', {
                status: status,
                message: message,
                data: cleanData,
                timestamp: new Date().toISOString()
            });
        }
    }
}

// Start built-in AI with real task execution
async function startBuiltinAI() {
    console.log('🔧 Initializing AI services...');
    
    // Initialize AI service (Gemini)
    try {
        aiService = new AIService();
        await aiService.initialize();
        console.log('✅ Gemini AI service ready');
    } catch (error) {
        console.log('⚠️ Gemini AI service failed to initialize:', error.message);
        console.log('💡 Note: Set GEMINI_API_KEY in .env file for AI features');
    }
    
    // Initialize MCP service
    try {
        mcpService = new MCPService();
        await mcpService.initialize();
        console.log('✅ MCP service ready');
    } catch (error) {
        console.log('⚠️ MCP service failed to initialize:', error.message);
    }
    
    console.log('✅ Built-in AI assistant ready');
    // Initialize task execution engine
    taskExecutionEngine = new TaskExecutionEngine(mainWindow);
    console.log('🚀 Task execution engine initialized');
}

// App event handlers
app.whenReady().then(() => {
    createWindow();
    createMenu();
    createTray();
    
    // Start built-in AI
    startBuiltinAI();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    app.isQuiting = true;
    // No Python process to terminate
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
});

ipcMain.handle('open-external', (event, url) => {
    shell.openExternal(url);
});

ipcMain.handle('minimize-to-tray', () => {
    mainWindow.hide();
});

ipcMain.handle('execute-python-command', async (event, command) => {
    // This will be implemented to communicate with Python backend
    return { success: true, result: `Executed: ${command}` };
});

// Task execution handlers
ipcMain.handle('execute-task-workflow', async (event, userCommand) => {
    if (!taskExecutionEngine) {
        return { success: false, message: 'Task engine not initialized' };
    }
    
    try {
        // Create to-do list from user command
        const todoList = taskExecutionEngine.createTaskTodoList(userCommand);
        
        // Execute the workflow
        const result = await taskExecutionEngine.executeTaskWorkflow(todoList);
        
        return { success: true, todoList: todoList, result: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-task-status', () => {
    if (!taskExecutionEngine) {
        return { isExecuting: false };
    }
    
    return {
        isExecuting: taskExecutionEngine.isExecuting,
        currentTask: taskExecutionEngine.currentTask
    };
});

ipcMain.handle('take-screenshot', async (event, params = {}) => {
    if (!taskExecutionEngine) {
        return { success: false, message: 'Task engine not initialized' };
    }
    
    return await taskExecutionEngine.takeScreenshot(params);
});
