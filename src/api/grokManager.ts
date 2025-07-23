import { config } from '../config/environment';
import { ActionObject } from '../types';

interface OpenRouterResponse {
  action: string;
  target?: string;
  fields?: Record<string, any>;
  options?: {
    submit?: boolean;
    confirm?: boolean;
    validate?: boolean;
  };
  sequence?: Array<{
    step: number;
    action: string;
    fields?: Record<string, any>;
  }>;
  message?: string;
}

export class OpenRouterAPIManager {
  private requestCount = 0;
  private dailyRequestCount = 0;
  private resetTime = Date.now() + 60000; // Reset every minute
  private dailyResetTime = Date.now() + 86400000; // Reset every day
  private isInitialized = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      if (!config.api.openrouterApiKey) {
        console.warn('OpenRouter API key not found. Using mock responses.');
        return;
      }

      this.isInitialized = true;
      
      if (config.app.debugMode) {
        console.log('OpenRouter API Manager initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize OpenRouter API client:', error);
      this.isInitialized = false;
    }
  }

  private checkRateLimit(): void {
    const now = Date.now();
    
    // Reset minute counter
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }

    // Reset daily counter
    if (now > this.dailyResetTime) {
      this.dailyRequestCount = 0;
      this.dailyResetTime = now + 86400000;
    }

    // Check daily limit
    if (this.dailyRequestCount >= config.api.rateLimitPerDay) {
      throw new Error('Daily rate limit exceeded. Please try again tomorrow.');
    }

    // Check minute limit
    if (this.requestCount >= config.api.rateLimitPerMinute) {
      throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
    }

    this.requestCount++;
    this.dailyRequestCount++;
  }

  private getSystemPrompt(): string {
  return `You are an AI assistant that converts natural language commands into structured JSON actions for a web application.

## Bot Management Actions
- create_bot: Create new bot with fields: name, description, type, selectionCriteria, isActive

## Bot Types Available
- Customer Service: For handling customer inquiries and support
- Recruitment: For candidate selection and hiring processes  
- Technical Support: For technical issue resolution
- Email Assistant: For email management and communication
- General Assistant: For general purpose tasks

## Response Format
Return ONLY valid JSON (no markdown):

{
  "action": "create_bot",
  "target": "bots",
  "fields": {
    "name": "extracted_bot_name",
    "description": "extracted_description", 
    "type": "appropriate_bot_type",
    "isActive": true,
    "selectionCriteria": []
  },
  "options": {
    "submit": true,
    "validate": true
  },
  "message": "Creating bot with specified details"
}

## Example
Input: "create a bot with name emailsender that will send emails to employees"
Output: {"action": "create_bot", "target": "bots", "fields": {"name": "emailsender", "description": "will send emails to employees", "type": "Email Assistant", "isActive": true, "selectionCriteria": []}, "options": {"submit": true}, "message": "Creating email assistant bot named 'emailsender'"}

Extract exact names and descriptions from user input. Infer appropriate bot types based on functionality described.`;
}


  private async makeAPICall(userInput: string, attempt = 1): Promise<OpenRouterResponse> {
    if (!this.isInitialized) {
      throw new Error('OpenRouter API client not initialized. Please check your API key configuration.');
    }

    try {
      this.checkRateLimit();

      const response = await fetch(`${config.api.openrouterBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.api.openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Assistant Hub'
        },
        body: JSON.stringify({
          model: config.api.openrouterModel,
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            { role: 'user', content: userInput }
          ],
          max_tokens: 1000,
          temperature: 0.1,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from OpenRouter API');
      }

      // Clean up any markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(cleanContent);
    } catch (error: any) {
      if (config.app.debugMode) {
        console.error(`OpenRouter API Error (attempt ${attempt}):`, error);
      }

      // Retry logic
      if (attempt < config.api.maxRetries && this.shouldRetry(error)) {
        await this.delay(1000 * attempt);
        return this.makeAPICall(userInput, attempt + 1);
      }

      throw new Error(`API call failed: ${error.message}`);
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, rate limits, and server errors
    return error.name === 'TypeError' || // Network errors
           error.message.includes('rate limit') || 
           error.message.includes('500') ||
           error.message.includes('502') ||
           error.message.includes('503');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getMockResponse(userInput: string): ActionObject {
    const input = userInput.toLowerCase().trim();
    
    // Simple command parsing for fallback
    if (input.includes('dashboard') || input.includes('home')) {
      return {
        action: 'navigate',
        target: 'dashboard',
        message: 'Navigating to dashboard',
      };
    }
    
    if (input.includes('users') || input.includes('user')) {
      if (input.includes('add') || input.includes('create')) {
        const nameMatch = input.match(/name[d]?\s+([a-zA-Z\s]+?)(?:\s+with|\s+email|$)/);
        const emailMatch = input.match(/email\s+([^\s]+)/);
        const roleMatch = input.match(/role\s+(admin|user|viewer)/);
        
        return {
          action: 'add_user',
          fields: {
            name: nameMatch ? nameMatch[1].trim() : '',
            email: emailMatch ? emailMatch[1] : '',
            role: roleMatch ? roleMatch[1].charAt(0).toUpperCase() + roleMatch[1].slice(1) : 'User',
            department: '',
          },
          message: 'Adding new user',
        };
      }
      return {
        action: 'navigate',
        target: 'users',
        message: 'Navigating to users page',
      };
    }
    
    if (input.includes('bot')) {
      if (input.includes('create') || input.includes('add')) {
        const nameMatch = input.match(/bot\s+named\s+([a-zA-Z0-9]+)/);
        const typeMatch = input.match(/(customer service|recruitment|technical support|general assistant)/);
        
        return {
          action: 'create_bot',
          fields: {
            name: nameMatch ? nameMatch[1] : '',
            description: '',
            type: typeMatch ? typeMatch[1].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'General Assistant',
            selectionCriteria: [],
            isActive: true,
          },
          message: 'Creating new bot',
        };
      }
      return {
        action: 'navigate',
        target: 'bots',
        message: 'Navigating to bots page',
      };
    }
    
    if (input.includes('command')) {
      return {
        action: 'navigate',
        target: 'commands',
        message: 'Navigating to AI command center',
      };
    }
    
    return {
      action: 'error',
      message: 'Sorry, I couldn\'t understand that command. Please try again.',
    };
  }

  async processCommand(userInput: string): Promise<ActionObject> {
    try {
      if (!userInput.trim()) {
        throw new Error('Please enter a command');
      }

      // Use OpenRouter API if available, otherwise fall back to mock responses
      if (this.isInitialized && config.api.openrouterApiKey) {
        const openrouterResponse = await this.makeAPICall(userInput);
        return {
          action: openrouterResponse.action,
          target: openrouterResponse.target,
          fields: openrouterResponse.fields,
          message: openrouterResponse.message || 'Command processed successfully',
        };
      } else {
        // Fallback to mock processing
        if (config.app.debugMode) {
          console.log('Using mock command processing (OpenRouter API not available)');
        }
        return this.getMockResponse(userInput);
      }
    } catch (error: any) {
      if (config.app.debugMode) {
        console.error('Command processing error:', error);
      }
      
      return {
        action: 'error',
        message: error.message || 'Failed to process command. Please try again.',
      };
    }
  }

  async validateConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isInitialized || !config.api.openrouterApiKey) {
        return { 
          success: false, 
          message: 'API client not initialized. Please check your configuration.' 
        };
      }

      const response = await fetch(`${config.api.openrouterBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.api.openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Assistant Hub'
        },
        body: JSON.stringify({
          model: config.api.openrouterModel,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10,
        })
      });

      if (response.ok) {
        return { success: true, message: 'Connection successful' };
      } else {
        return { success: false, message: `Connection failed: ${response.statusText}` };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: `Connection failed: ${error.message}` 
      };
    }
  }

  getStatus(): { initialized: boolean; hasApiKey: boolean; requestCount: number; dailyRequestCount: number } {
    return {
      initialized: this.isInitialized,
      hasApiKey: !!config.api.openrouterApiKey,
      requestCount: this.requestCount,
      dailyRequestCount: this.dailyRequestCount,
    };
  }
}

// Export singleton instance
export const openRouterManager = new OpenRouterAPIManager();