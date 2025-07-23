import { ActionObject } from '../types';
import { openRouterManager } from '../api/grokManager';

export async function processCommand(userInput: string): Promise<ActionObject> {
  try {
    return await openRouterManager.processCommand(userInput);
  } catch (error: any) {
    return {
      action: 'error',
      message: error.message || 'Failed to process command. Please try again.',
    };
  }
}

export function executeAction(actionObj: ActionObject, onNavigate: (page: string) => void, onAddUser?: (user: any) => void, onCreateBot?: (bot: any) => void): void {
  switch (actionObj.action) {
    case 'navigate':
      if (actionObj.target) {
        onNavigate(actionObj.target);
      }
      break;
    case 'add_user':
      if (onAddUser && actionObj.fields) {
        onAddUser(actionObj.fields);
      }
      break;
    case 'create_bot':
      if (onCreateBot && actionObj.fields) {
        // Automatically create the bot without showing form
        const botData = {
          name: actionObj.fields.name || 'NewBot',
          description: actionObj.fields.description || 'AI assistant bot',
          type: actionObj.fields.type || 'General Assistant',
          selectionCriteria: actionObj.fields.selectionCriteria || [],
          isActive: actionObj.fields.isActive !== undefined ? actionObj.fields.isActive : true,
        };
        onCreateBot(botData);
        // Navigate to bots page to show the created bot
        onNavigate('bots');
      }
      break;
    default:
      break;
  }
}