// AI Agent Desktop - Renderer Process
const { ipcRenderer } = require('electron');
// Removed socket.io-client dependency - using built-in AI simulation

class AIAgentApp {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.conversationHistory = [];
        this.currentTaskId = null;
        
        // DOM elements
        this.elements = {
            loadingScreen: document.getElementById('loadingScreen'),
            connectionStatus: document.getElementById('connectionStatus'),
            chatMessages: document.getElementById('chatMessages'),
            chatInput: document.getElementById('chatInput'),
            sendButton: document.getElementById('sendButton'),
            typingIndicator: document.getElementById('typingIndicator'),
            minimizeBtn: document.getElementById('minimizeBtn'),
            closeBtn: document.getElementById('closeBtn'),
            clearChatBtn: document.getElementById('clearChatBtn'),
            exportChatBtn: document.getElementById('exportChatBtn'),
            appVersion: document.getElementById('appVersion'),
            backendStatus: document.getElementById('backendStatus'),
            performanceIndicator: document.getElementById('performanceIndicator'),
            inputCounter: document.getElementById('inputCounter'),
            cpuUsage: document.getElementById('cpuUsage'),
            memUsage: document.getElementById('memUsage'),
            taskCount: document.getElementById('taskCount')
        };
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🚀 Initializing AI Agent Desktop...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Get app version
        await this.loadAppInfo();
        
        // Connect to Python backend
        await this.connectToBackend();
        
        // Start system monitoring
        this.startSystemMonitoring();
        
        // Hide loading screen
        setTimeout(() => {
            this.elements.loadingScreen.classList.add('hidden');
        }, 2000);
        
        console.log('✅ AI Agent Desktop initialized');
    }
    
    setupEventListeners() {
        // Title bar controls
        this.elements.minimizeBtn?.addEventListener('click', () => {
            ipcRenderer.invoke('minimize-to-tray');
        });
        
        this.elements.closeBtn?.addEventListener('click', () => {
            if (this.elements.minimizeToTray?.checked) {
                ipcRenderer.invoke('minimize-to-tray');
            } else {
                window.close();
            }
        });
        
        // Chat functionality
        this.elements.sendButton?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        this.elements.chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.elements.chatInput?.addEventListener('input', () => {
            this.updateInputCounter();
            this.autoResize();
        });
        
        // Chat actions
        this.elements.clearChatBtn?.addEventListener('click', () => {
            this.clearChat();
        });
        
        this.elements.exportChatBtn?.addEventListener('click', () => {
            this.exportChat();
        });
        
        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.executeQuickAction(action);
            });
        });
        
        // Settings toggles
        document.querySelectorAll('.toggle-switch input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.handleSettingChange(e.target.id, e.target.checked);
            });
        });
        
        // Listen for task progress updates from main process
        ipcRenderer.on('task-progress', (event, progressData) => {
            this.handleTaskProgress(progressData);
        });
    }
    
    async loadAppInfo() {
        try {
            const version = await ipcRenderer.invoke('get-app-version');
            if (this.elements.appVersion) {
                this.elements.appVersion.textContent = `v${version}`;
            }
        } catch (error) {
            console.error('Failed to load app info:', error);
        }
    }
    
    async connectToBackend() {
        console.log('🔌 Initializing built-in AI assistant...');
        
        // Simulate connection delay
        setTimeout(() => {
            console.log('✅ Built-in AI assistant ready');
            this.isConnected = true;
            this.updateConnectionStatus('connected', 'AI Ready');
            this.updateBackendStatus('Backend: Built-in');
        }, 1000);
    }
    
    updateConnectionStatus(status, text) {
        const statusDot = this.elements.connectionStatus?.querySelector('.status-dot');
        const statusText = this.elements.connectionStatus?.querySelector('.status-text');
        
        if (statusDot) {
            statusDot.className = `status-dot ${status}`;
        }
        
        if (statusText) {
            statusText.textContent = text;
        }
    }
    
    updateBackendStatus(status) {
        if (this.elements.backendStatus) {
            this.elements.backendStatus.textContent = status;
        }
    }
    
    async sendMessage() {
        const message = this.elements.chatInput?.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        if (this.elements.chatInput) {
            this.elements.chatInput.value = '';
            this.updateInputCounter();
            this.autoResize();
        }
        
        // Show initial AI response with to-do list
        this.showInitialResponse(message);
        
        // Execute real task workflow
        try {
            const result = await ipcRenderer.invoke('execute-task-workflow', message);
            
            if (result.success && result.todoList) {
                // Show the created to-do list
                this.showTodoList(result.todoList);
            } else {
                this.addMessage(`❌ Failed to create task: ${result.message}`, 'assistant');
            }
        } catch (error) {
            this.addMessage(`❌ Error executing task: ${error.message}`, 'assistant');
        }
    }
    
    showInitialResponse(userMessage) {
        const message = userMessage.toLowerCase();
        let response = '';
        
        if (message.includes('open') && (message.includes('website') || message.includes('browser') || message.includes('google') || message.includes('youtube'))) {
            response = `🎯 **Creating Website Opening Workflow**

I'll help you open the website! Here's my plan:

🔍 **Analysis:** Website opening task detected
⚡ **Creating to-do list and executing...**`;
        } else if (message.includes('screenshot')) {
            response = `📸 **Creating Screenshot Workflow**

I'll capture your screen! Here's what I'll do:

🔍 **Analysis:** Screenshot task detected
⚡ **Creating to-do list and executing...**`;
        } else if (message.includes('file') || message.includes('folder')) {
            response = `📁 **Creating File Management Workflow**

I'll help you with file operations! Here's my plan:

🔍 **Analysis:** File operation task detected
⚡ **Creating to-do list and executing...**`;
        } else {
            response = `🤖 **Creating Task Workflow**

I understand you want: "${userMessage}"

🔍 **Analysis:** Processing your request
⚡ **Creating to-do list and executing...**`;
        }
        
        this.addMessage(response, 'assistant');
    }
    
    showTodoList(todoList) {
        let todoMessage = `📋 **CREATED TO-DO LIST:**

**Task ID:** ${todoList.id}
**Command:** "${todoList.userCommand}"
**Total Steps:** ${todoList.tasks.length}

**📝 Steps to Execute:**\n`;

        todoList.tasks.forEach((task, index) => {
            todoMessage += `**${index + 1}.** ${task.description}\n`;
        });
        
        todoMessage += `\n⚡ **Now executing each step...**`;
        
        this.addMessage(todoMessage, 'assistant');
        this.showTypingIndicator();
    }
    
    addMessage(content, sender) {
        const messagesContainer = this.elements.chatMessages;
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        
        // Handle markdown-like formatting
        const formattedContent = this.formatMessage(content);
        messageBubble.innerHTML = formattedContent;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString();
        
        messageContent.appendChild(messageBubble);
        messageContent.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to conversation history
        this.conversationHistory.push({
            role: sender,
            message: content,
            timestamp: new Date().toISOString()
        });
    }
    
    formatMessage(content) {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    showTypingIndicator() {
        if (this.elements.typingIndicator) {
            this.elements.typingIndicator.style.display = 'flex';
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }
    }
    
    hideTypingIndicator() {
        if (this.elements.typingIndicator) {
            this.elements.typingIndicator.style.display = 'none';
        }
    }
    
    handleAssistantResponse(data) {
        this.hideTypingIndicator();
        this.addMessage(data.message, 'assistant');
        this.updatePerformanceIndicator('⚡ Ready');
    }
    
    handleTaskProgress(progressData) {
        const { status, message, data } = progressData;
        
        switch (status) {
            case 'started':
                this.hideTypingIndicator();
                this.addMessage(`🚀 **TASK EXECUTION STARTED**\n${message}`, 'assistant');
                this.updatePerformanceIndicator('🚀 Starting...');
                break;
                
            case 'executing':
                this.hideTypingIndicator();
                
                if (data.currentStep && data.totalSteps) {
                    const progressMsg = `⚡ **STEP ${data.currentStep}/${data.totalSteps}**\n${message}`;
                    this.addMessage(progressMsg, 'assistant');
                    
                    // Show specific task action
                    if (data.task) {
                        const actionIcon = this.getActionIcon(data.task.action);
                        this.updatePerformanceIndicator(`${actionIcon} Step ${data.currentStep}/${data.totalSteps}`);
                    }
                } else {
                    this.addMessage(`⚡ **EXECUTING:** ${message}`, 'assistant');
                }
                break;
                
            case 'completed':
                this.hideTypingIndicator();
                
                let completionMsg = `✅ **TASK COMPLETED SUCCESSFULLY!**\n\n📊 **Summary:**`;
                if (data.totalSteps) {
                    completionMsg += `\n• Steps executed: ${data.totalSteps}`;
                }
                if (data.screenshotsTaken) {
                    completionMsg += `\n• Screenshots taken: ${data.screenshotsTaken}`;
                }
                completionMsg += `\n• Status: All tasks completed successfully ✨`;
                
                this.addMessage(completionMsg, 'assistant');
                this.updatePerformanceIndicator('✅ Task Complete');
                
                // Auto-hide performance indicator after success
                setTimeout(() => {
                    this.updatePerformanceIndicator('⚡ Ready');
                }, 5000);
                break;
                
            case 'error':
                this.hideTypingIndicator();
                this.addMessage(`❌ **TASK FAILED**\n\nError: ${message}`, 'assistant');
                this.updatePerformanceIndicator('❌ Task Failed');
                
                setTimeout(() => {
                    this.updatePerformanceIndicator('⚡ Ready');
                }, 5000);
                break;
                
            default:
                console.log('Unknown task progress status:', progressData);
        }
    }
    
    getActionIcon(action) {
        const icons = {
            'screenshot': '📸',
            'open_browser': '🌐',
            'wait': '⏱️',
            'validate': '✅',
            'list_files': '📁',
            'terminal_command': '💻',
            'analyze_screenshot': '🔍',
            'analyze': '🧠'
        };
        return icons[action] || '⚡';
    }
    
    updatePerformanceIndicator(text) {
        if (this.elements.performanceIndicator) {
            this.elements.performanceIndicator.textContent = text;
        }
    }
    
    executeQuickAction(action) {
        const actionMessages = {
            screenshot: 'Take a screenshot of my current screen',
            browser: 'Open a web browser and navigate to google.com',
            terminal: 'Execute terminal command to show current directory',
            file: 'Show me the files in my current directory',
            workflow: 'Open YouTube in browser'
        };
        
        const message = actionMessages[action];
        if (message) {
            this.elements.chatInput.value = message;
            this.sendMessage();
        }
    }
    
    clearChat() {
        if (this.elements.chatMessages) {
            // Keep only the welcome message
            const welcomeMessage = this.elements.chatMessages.querySelector('.message.welcome');
            this.elements.chatMessages.innerHTML = '';
            if (welcomeMessage) {
                this.elements.chatMessages.appendChild(welcomeMessage);
            }
        }
        this.conversationHistory = [];
    }
    
    async exportChat() {
        try {
            const chatData = {
                timestamp: new Date().toISOString(),
                conversation: this.conversationHistory
            };
            
            const dataStr = JSON.stringify(chatData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-agent-chat-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showSuccessMessage('Chat Exported', 'Chat history has been exported successfully.');
        } catch (error) {
            console.error('Failed to export chat:', error);
            this.showErrorMessage('Export Failed', 'Failed to export chat history.');
        }
    }
    
    updateInputCounter() {
        const input = this.elements.chatInput;
        const counter = this.elements.inputCounter;
        
        if (input && counter) {
            const length = input.value.length;
            counter.textContent = `${length}/2000`;
            
            if (length > 2000) {
                counter.style.color = 'var(--danger-color)';
            } else {
                counter.style.color = '';
            }
        }
    }
    
    autoResize() {
        const input = this.elements.chatInput;
        if (input) {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        }
    }
    
    handleSettingChange(settingId, value) {
        console.log(`Setting changed: ${settingId} = ${value}`);
        
        // Handle specific settings
        switch (settingId) {
            case 'notificationsEnabled':
                // Toggle notification settings
                break;
            case 'minimizeToTray':
                // Toggle minimize to tray behavior
                break;
            case 'autoStartEnabled':
                // Toggle auto-start
                break;
        }
        
        // Save settings to local storage
        localStorage.setItem(settingId, value.toString());
    }
    
    loadSettings() {
        // Load settings from local storage
        const settings = ['notificationsEnabled', 'minimizeToTray', 'autoStartEnabled'];
        
        settings.forEach(settingId => {
            const element = document.getElementById(settingId);
            const saved = localStorage.getItem(settingId);
            
            if (element && saved !== null) {
                element.checked = saved === 'true';
            }
        });
    }
    
    startSystemMonitoring() {
        // Update system stats periodically
        setInterval(() => {
            this.updateSystemStats();
        }, 2000);
    }
    
    updateSystemStats() {
        // Simulate system stats (in a real app, you'd get these from the main process)
        if (this.elements.cpuUsage) {
            this.elements.cpuUsage.textContent = Math.floor(Math.random() * 30 + 5) + '%';
        }
        
        if (this.elements.memUsage) {
            this.elements.memUsage.textContent = Math.floor(Math.random() * 40 + 20) + '%';
        }
        
        if (this.elements.taskCount) {
            this.elements.taskCount.textContent = this.conversationHistory.length.toString();
        }
    }
    
    showSuccessMessage(title, message) {
        // Show success notification
        console.log(`✅ ${title}: ${message}`);
    }
    
    showErrorMessage(title, message) {
        // Show error notification
        console.error(`❌ ${title}: ${message}`);
    }
    
    // Built-in AI Simulation System
    simulateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Simulate thinking time
        const thinkingTime = Math.random() * 2000 + 1000; // 1-3 seconds
        
        setTimeout(() => {
            let response = this.generateAIResponse(userMessage);
            
            // Sometimes simulate task execution
            if (this.isTaskCommand(message)) {
                this.simulateTaskExecution(message, response);
            } else {
                this.handleAssistantResponse({ message: response });
            }
        }, thinkingTime);
    }
    
    isTaskCommand(message) {
        const taskKeywords = ['screenshot', 'browser', 'open', 'file', 'terminal', 'automate', 'execute', 'run', 'launch'];
        return taskKeywords.some(keyword => message.includes(keyword));
    }
    
    simulateTaskExecution(message, response) {
        // Show initial response
        this.handleAssistantResponse({ message: response });
        
        // Simulate task execution steps
        const steps = this.getTaskSteps(message);
        let stepIndex = 0;
        
        const executeStep = () => {
            if (stepIndex < steps.length) {
                const step = steps[stepIndex];
                this.updatePerformanceIndicator(`🔄 ${step}`);
                
                // Add progress message
                setTimeout(() => {
                    this.addMessage(`📋 **Step ${stepIndex + 1}:** ${step}`, 'assistant');
                    stepIndex++;
                    setTimeout(executeStep, 1500); // Next step after 1.5s
                }, 800);
            } else {
                // Task complete
                this.updatePerformanceIndicator('✅ Task Complete');
                setTimeout(() => {
                    this.addMessage('✅ **Task completed successfully!** All operations have been executed.', 'assistant');
                }, 1000);
            }
        };
        
        setTimeout(executeStep, 1000);
    }
    
    getTaskSteps(message) {
        if (message.includes('screenshot')) {
            return [
                'Capturing current screen',
                'Analyzing screenshot content',
                'Saving to screenshots folder',
                'Processing image metadata'
            ];
        } else if (message.includes('browser') || message.includes('google')) {
            return [
                'Opening web browser',
                'Navigating to target website',
                'Loading page content',
                'Ready for interaction'
            ];
        } else if (message.includes('file') || message.includes('folder')) {
            return [
                'Accessing file system',
                'Scanning directory structure',
                'Organizing file information',
                'Preparing file operations'
            ];
        } else if (message.includes('terminal')) {
            return [
                'Initializing terminal session',
                'Setting up environment',
                'Executing command',
                'Processing output'
            ];
        } else {
            return [
                'Analyzing request',
                'Planning execution',
                'Executing task',
                'Finalizing results'
            ];
        }
    }
    
    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Greetings
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return "👋 Hello! I'm your AI Agent Desktop assistant. I'm ready to help you automate tasks, manage files, browse the web, and much more. What would you like me to do today?";
        }
        
        // Screenshot requests
        if (message.includes('screenshot') || message.includes('capture screen')) {
            return "📸 **Taking a screenshot now!** I'll capture your current screen and save it to the screenshots folder. You can use this for documentation, sharing, or analysis purposes.";
        }
        
        // Browser automation
        if (message.includes('browser') || message.includes('google') || message.includes('website')) {
            return "🌐 **Opening web browser for you!** I'll launch your default browser and navigate to the requested site. I can help with web searches, form filling, data extraction, and more.";
        }
        
        // Terminal commands
        if (message.includes('terminal') || message.includes('command') || message.includes('shell')) {
            return "💻 **Accessing terminal now!** I'll execute the requested command and show you the output. I can run system commands, manage processes, and interact with command-line tools.";
        }
        
        // File operations
        if (message.includes('file') || message.includes('folder') || message.includes('directory')) {
            return "📁 **Managing your files!** I can create, move, copy, delete, and organize files and folders. I'll help you keep your file system organized and efficient.";
        }
        
        // Workflow automation
        if (message.includes('workflow') || message.includes('automate') || message.includes('sequence')) {
            return "⚙️ **Setting up automation workflow!** I'll create a sequence of actions to automate your repetitive tasks. This can save you time and reduce manual work.";
        }
        
        // YouTube request
        if (message.includes('youtube')) {
            return "📺 **Opening YouTube!** I'll launch your browser and navigate to YouTube. I can help you search for videos, manage playlists, or even download content if needed.";
        }
        
        // Help requests
        if (message.includes('help') || message.includes('what can you do')) {
            return `🤖 **I'm your comprehensive AI automation assistant!** Here's what I can help you with:

**🌐 Web Automation:**
• Browse websites and extract information
• Fill forms and interact with web pages
• Perform searches and gather data

**📁 File Management:**
• Create, move, copy, and organize files
• Batch rename and process files
• Clean up directories and manage storage

**💻 System Operations:**
• Execute terminal commands
• Monitor system performance
• Manage running processes

**📸 Screen Capture:**
• Take screenshots and recordings
• Analyze screen content
• Document workflows

**⚙️ Task Automation:**
• Create custom workflows
• Schedule repetitive tasks
• Chain multiple operations

Just tell me what you'd like to accomplish, and I'll break it down into actionable steps!`;
        }
        
        // Programming/coding help
        if (message.includes('code') || message.includes('programming') || message.includes('script')) {
            return "👨‍💻 **Ready to help with coding!** I can assist with writing scripts, debugging code, explaining programming concepts, and automating development workflows. What programming task can I help you with?";
        }
        
        // Default intelligent response
        const responses = [
            `🎯 **I understand you want help with:** "${userMessage}"

I'm analyzing your request and preparing to assist you. I can handle a wide variety of automation tasks including:

• **System Operations** - File management, terminal commands
• **Web Automation** - Browser control, data extraction  
• **Workflow Creation** - Multi-step task automation
• **Content Processing** - Screenshots, document handling

Could you provide a bit more detail about what specific action you'd like me to take?`,

            `🔍 **Processing your request:** "${userMessage}"

Based on what you've asked, I'm ready to help! I specialize in:

• **Desktop Automation** - Control applications and system functions
• **Data Management** - Organize and process information
• **Web Tasks** - Browse, search, and interact with websites
• **Custom Workflows** - Create automated sequences for repetitive tasks

What would you like me to focus on first?`,

            `⚡ **Working on your request!** I've analyzed what you're asking for and I'm ready to help.

I can assist with automation tasks like:
• Opening applications and managing windows
• Processing files and organizing data
• Web browsing and information gathering
• Creating custom automation workflows

Let me know if you need me to break this down into specific steps or if you'd like to try a different approach!`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiAgent = new AIAgentApp();
});

// Handle unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
