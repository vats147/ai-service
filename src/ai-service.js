// AI Service with Gemini Integration
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
        this.genAI = null;
        this.model = null;
        this.isInitialized = false;
    }
    
    async initialize() {
        try {
            if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE' || this.apiKey === 'your_gemini_api_key_here') {
                console.log('⚠️  No Gemini API key found - using fallback mode');
                this.isInitialized = false;
                return;
            }
            
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            this.isInitialized = true;
            
            console.log('✅ Gemini AI initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Gemini AI:', error);
            this.isInitialized = false;
        }
    }
    
    async analyzeUserCommand(userCommand) {
        if (!this.isInitialized) {
            return this.fallbackAnalysis(userCommand);
        }
        
        try {
            const prompt = `
You are an AI task automation assistant. Analyze this user command and create a detailed execution plan.

User Command: "${userCommand}"

Please provide a JSON response with:
1. "intent": What the user wants to accomplish
2. "category": Type of task (browser, file, system, screenshot, etc.)
3. "confidence": How confident you are (0-1)
4. "tasks": Array of specific steps to execute
5. "priority": Task priority (low, medium, high)
6. "estimatedTime": Estimated completion time in seconds

For each task in the array, include:
- "action": Specific action type
- "description": Human readable description
- "params": Parameters needed for execution
- "validation": How to verify success

Respond ONLY with valid JSON.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Try to parse JSON response
            try {
                // Clean up the response text - remove markdown code blocks if present
                let jsonText = text.trim();
                
                // Remove markdown code blocks
                if (jsonText.startsWith('```json')) {
                    jsonText = jsonText.replace(/```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonText.startsWith('```')) {
                    jsonText = jsonText.replace(/```\s*/, '').replace(/\s*```$/, '');
                }
                
                const analysis = JSON.parse(jsonText);
                return {
                    success: true,
                    analysis: analysis,
                    source: 'gemini'
                };
            } catch (parseError) {
                console.error('Failed to parse Gemini response:', parseError);
                return this.fallbackAnalysis(userCommand);
            }
            
        } catch (error) {
            console.error('Gemini API error:', error);
            return this.fallbackAnalysis(userCommand);
        }
    }
    
    async generateResponse(userCommand, context = {}) {
        if (!this.isInitialized) {
            return this.fallbackResponse(userCommand, context);
        }
        
        try {
            const prompt = `
You are a helpful AI desktop automation assistant. The user asked: "${userCommand}"

Context: ${JSON.stringify(context)}

Provide a friendly, helpful response explaining what you're going to do. Be specific about the steps you'll take.

Keep the response concise but informative. Use emojis appropriately.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            
            return {
                success: true,
                message: response.text(),
                source: 'gemini'
            };
            
        } catch (error) {
            console.error('Gemini response generation error:', error);
            return this.fallbackResponse(userCommand, context);
        }
    }
    
    async analyzeScreenshot(screenshotPath, context = {}) {
        if (!this.isInitialized) {
            return {
                success: false,
                message: 'Screenshot analysis requires Gemini API key'
            };
        }
        
        try {
            // For screenshot analysis, we'd need to implement image processing
            // This is a placeholder for future implementation
            return {
                success: true,
                analysis: 'Screenshot analysis feature coming soon with Gemini Vision',
                source: 'gemini'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Fallback methods when AI is not available
    fallbackAnalysis(userCommand) {
        const command = userCommand.toLowerCase();
        let category = 'general';
        let tasks = [];
        
        if (command.includes('open') && (command.includes('browser') || command.includes('google') || command.includes('youtube'))) {
            category = 'browser';
            let url = 'https://google.com';
            
            if (command.includes('youtube')) {
                url = 'https://youtube.com';
            } else if (command.includes('google')) {
                url = 'https://google.com';
            }
            
            tasks = [
                {
                    action: 'screenshot',
                    description: 'Take initial screenshot to see current state',
                    params: { reason: 'initial_state' },
                    validation: 'Screenshot file created'
                },
                {
                    action: 'open_browser',
                    description: `Open browser and navigate to ${url}`,
                    params: { url: url },
                    validation: 'Browser opened successfully'
                },
                {
                    action: 'wait',
                    description: 'Wait for page to load',
                    params: { duration: 3000 },
                    validation: 'Wait completed'
                },
                {
                    action: 'screenshot',
                    description: 'Take screenshot to verify website loaded',
                    params: { reason: 'verify_website' },
                    validation: 'Website screenshot captured'
                },
                {
                    action: 'validate',
                    description: 'Check if website loaded correctly',
                    params: { retry_if_failed: true },
                    validation: 'Website validation passed'
                }
            ];
        } else if (command.includes('screenshot') || command.includes('capture')) {
            category = 'screenshot';
            tasks = [
                {
                    action: 'screenshot',
                    description: 'Capture current screen',
                    params: { reason: 'user_requested' },
                    validation: 'Screenshot captured successfully'
                }
            ];
        } else if (command.includes('file') || command.includes('folder')) {
            category = 'file';
            tasks = [
                {
                    action: 'list_files',
                    description: 'List current directory files',
                    params: { directory: process.cwd() },
                    validation: 'File list retrieved'
                },
                {
                    action: 'screenshot',
                    description: 'Take screenshot of current context',
                    params: { reason: 'file_operations' },
                    validation: 'Context screenshot taken'
                }
            ];
        } else if (command.includes('terminal') || command.includes('command')) {
            category = 'terminal';
            tasks = [
                {
                    action: 'terminal_command',
                    description: 'Execute terminal command',
                    params: { command: 'ls -la' },
                    validation: 'Command executed successfully'
                },
                {
                    action: 'screenshot',
                    description: 'Take screenshot of terminal output',
                    params: { reason: 'terminal_execution' },
                    validation: 'Terminal screenshot captured'
                }
            ];
        }
        
        return {
            success: true,
            analysis: {
                intent: userCommand,
                category: category,
                confidence: 0.8,
                tasks: tasks,
                priority: 'medium',
                estimatedTime: tasks.length * 2
            },
            source: 'fallback'
        };
    }
    
    fallbackResponse(userCommand, context) {
        return {
            success: true,
            message: `I'll help you with: "${userCommand}". Let me break this down into steps and execute them for you.`,
            source: 'fallback'
        };
    }
}

module.exports = AIService;
