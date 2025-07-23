import React, { useState } from 'react';
import { Command } from '../types';
import { Terminal, Send, Clock, CheckCircle, XCircle, Mic, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import APIStatus from '../components/APIStatus';
import { processCommand, executeAction } from '../utils/commandProcessor';
import { config } from '../config/environment';

interface AICommandCenterProps {
  commands: Command[];
  onAddCommand: (command: Command) => void;
  onNavigate: (page: string) => void;
  onAddUser?: (user: any) => void;
  onCreateBot?: (bot: any) => void;
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void;
}

const exampleCommands = [
  'Go to dashboard',
  'Add a user named John with email john@company.com and role admin',
  'Create a recruitment bot that selects candidates based on scores and resume',
  'Show all users',
  'Delete the bot named TestBot',
  'Fill the user form with name Sarah, email sarah@test.com, role user',
  'Navigate to bots page',
  'Create a customer service bot named SupportBot',
  'Show bot statistics',
];

export default function AICommandCenter({ 
  commands, 
  onAddCommand, 
  onNavigate, 
  onAddUser, 
  onCreateBot, 
  showToast 
}: AICommandCenterProps) {
  const [commandInput, setCommandInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionPreview, setActionPreview] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setActionPreview(null);

    try {
      const actionObj = await processCommand(commandInput);
      
      const newCommand: Command = {
        id: Date.now().toString(),
        command: commandInput,
        timestamp: new Date().toISOString(),
        status: actionObj.action === 'error' ? 'error' : 'success',
      };

      onAddCommand(newCommand);

      if (actionObj.action === 'error') {
        showToast('error', actionObj.message || 'Command failed');
      } else {
        // For bot creation, execute immediately without preview
        if (actionObj.action === 'create_bot') {
          executeAction(actionObj, onNavigate, onAddUser, onCreateBot);
          showToast('success', actionObj.message || 'Bot created successfully');
          setCommandInput('');
        } else {
          // For other actions, show preview
          setActionPreview(actionObj);
        }
      }
    } catch (error) {
      const newCommand: Command = {
        id: Date.now().toString(),
        command: commandInput,
        timestamp: new Date().toISOString(),
        status: 'error',
      };
      onAddCommand(newCommand);
      showToast('error', 'Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteAction = () => {
    if (!actionPreview) return;

    executeAction(actionPreview, onNavigate, onAddUser, onCreateBot);
    showToast('success', actionPreview.message || 'Command executed successfully');
    
    setCommandInput('');
    setActionPreview(null);
  };

  const handleExampleClick = (example: string) => {
    setCommandInput(example);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">AI Command Center</h1>
          <APIStatus />
        </div>
        
        <p className="text-gray-600">Control your system using natural language commands powered by OpenRouter's free DeepSeek models</p>
        
        {!config.api.openrouterApiKey && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <div>
                <p className="text-sm font-medium text-yellow-800">API Key Required</p>
                <p className="text-sm text-yellow-700">
                  To use advanced AI command processing, please add your OpenRouter API key to the .env file. 
                  Currently using basic command parsing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="command" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Command
            </label>
            <div className="relative">
              <Terminal className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <textarea
                id="command"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Enter your command (e.g., 'Create a bot named CustomerBot for handling support tickets')"
                rows={3}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isProcessing}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1 rounded"
                title="Voice input (coming soon)"
              >
                <Mic size={20} />
              </button>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!commandInput.trim() || isProcessing}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <LoadingSpinner size="small" />
              ) : (
                <Send size={20} />
              )}
              <span>{isProcessing ? 'Processing...' : 'Execute Command'}</span>
            </button>
            <button
              type="button"
              onClick={() => setCommandInput('')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Action Preview */}
      {actionPreview && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Action Preview</h3>
          <p className="text-blue-800 mb-4">{actionPreview.message}</p>
          {actionPreview.fields && (
            <div className="bg-white p-4 rounded border mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Fields to be filled:</h4>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(actionPreview.fields, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex space-x-3">
            <button
              onClick={handleExecuteAction}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm & Execute
            </button>
            <button
              onClick={() => setActionPreview(null)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Example Commands */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Commands</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {exampleCommands.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Command History */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Command History</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {commands.map((command) => (
            <div key={command.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {command.status === 'success' ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : command.status === 'error' ? (
                  <XCircle className="text-red-500" size={16} />
                ) : (
                  <Clock className="text-yellow-500" size={16} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{command.command}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(command.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {commands.length === 0 && (
            <div className="text-center py-8">
              <Terminal className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">No commands executed yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}