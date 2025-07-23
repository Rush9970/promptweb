import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Mic, Sparkles, Loader2 } from 'lucide-react';
import { processCommand, executeAction } from '../utils/commandProcessor';
import { Command } from '../types';

interface FloatingAICommandProps {
  onAddCommand: (command: Command) => void;
  onNavigate: (page: string) => void;
  onAddUser?: (user: any) => void;
  onCreateBot?: (bot: any) => void;
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void;
  currentPage?: string;
  formContext?: {
    type: 'user' | 'bot' | 'general';
    onFillForm?: (fields: any) => void;
    availableFields?: string[];
  };
}

export default function FloatingAICommand({
  onAddCommand,
  onNavigate,
  onAddUser,
  onCreateBot,
  showToast,
  currentPage,
  formContext
}: FloatingAICommandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Context-aware suggestions based on current page
  const getContextSuggestions = () => {
    const baseSuggestions = [
      'Go to dashboard',
      'Show me all users',
      'Navigate to bots page',
    ];

    if (currentPage === 'users' || formContext?.type === 'user') {
      return [
        ...baseSuggestions,
        'Add user John Smith with email john@company.com as admin',
        'Fill the form with name Sarah, email sarah@test.com, role user',
        'Create a manager user named Mike with email mike@company.com',
      ];
    }

    if (currentPage === 'bots' || formContext?.type === 'bot') {
      return [
        ...baseSuggestions,
        'Create a bot named EmailSender that will send emails to employees',
        'Fill bot form with name SupportBot, type Customer Service',
        'Create a recruitment bot for candidate screening',
        'Make a technical support bot named TechHelper',
      ];
    }

    return baseSuggestions;
  };

  useEffect(() => {
    setSuggestions(getContextSuggestions());
  }, [currentPage, formContext]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isProcessing) return;

    setIsProcessing(true);

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
        // Handle different action types
        if (actionObj.action === 'fill_form' && formContext?.onFillForm) {
          // Fill the current form
          formContext.onFillForm(actionObj.fields);
          showToast('success', 'Form filled successfully');
        } else if (actionObj.action === 'create_bot' || actionObj.action === 'add_user') {
          // Direct creation without form
          executeAction(actionObj, onNavigate, onAddUser, onCreateBot);
          showToast('success', actionObj.message || 'Action completed successfully');
        } else {
          // Other actions (navigation, etc.)
          executeAction(actionObj, onNavigate, onAddUser, onCreateBot);
          showToast('success', actionObj.message || 'Command executed successfully');
        }
        setCommandInput('');
        setIsOpen(false);
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

  const handleSuggestionClick = (suggestion: string) => {
    setCommandInput(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group"
        title="AI Command Assistant"
        aria-label="Open AI Command Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Modal Content */}
          <div className="relative m-8 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-lg text-gray-900">AI Command Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close AI Command Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {formContext && (
              <div className="mb-2 text-xs text-purple-700 font-medium">
                {formContext.type === 'user' ? 'User Form Assistant' : 
                 formContext.type === 'bot' ? 'Bot Form Assistant' : 
                 'General Assistant'}
              </div>
            )}
            {/* Content */}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
              {/* Command Input */}
              <textarea
                ref={inputRef}
                value={commandInput}
                onChange={e => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  formContext?.type === 'user' 
                    ? "Fill user form with name John, email john@company.com, role admin"
                    : formContext?.type === 'bot'
                    ? "Create a bot named EmailBot that sends emails to employees"
                    : "Tell me what you want to do..."
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                disabled={isProcessing}
              />
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {isProcessing ? 'Processing...' : 'Execute'}
                </button>
                <button
                  type="button"
                  onClick={() => setCommandInput('')}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  disabled={isProcessing}
                >
                  Clear
                </button>
              </div>
            </form>
            {/* Suggestions */}
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Quick suggestions:</div>
              <div className="flex flex-col space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
            {/* Help Text */}
            <div className="mt-2 text-xs text-gray-400">
              Tips: Use natural language like "Create a bot named SupportBot" or "Fill form with name John, email john@test.com". Press Ctrl+Enter to submit.
            </div>
          </div>
        </div>
      )}
    </>
  );
} 