import React, { useState } from 'react';
import { Bot } from '../types';
import { Bot as BotIcon, Edit, Trash2, Plus, X, Power, PowerOff } from 'lucide-react';
import FloatingAICommand from '../components/FloatingAICommand';

interface BotManagementProps {
  bots: Bot[];
  onAddBot: (bot: Omit<Bot, 'id' | 'createdAt'>) => void;
  onEditBot: (id: string, bot: Omit<Bot, 'id' | 'createdAt'>) => void;
  onDeleteBot: (id: string) => void;
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  prefilledForm?: Partial<Bot>;
  // AI Command props (optional)
  commands?: any[];
  onAddCommand?: (command: any) => void;
  onNavigate?: (page: string) => void;
  onAddUser?: (user: any) => void;
  onCreateBot?: (bot: any) => void;
}

export default function BotManagement({
  bots,
  onAddBot,
  onEditBot,
  onDeleteBot,
  showToast,
  showConfirm,
  prefilledForm,
  commands = [],
  onAddCommand = () => {},
  onNavigate = () => {},
  onAddUser = () => {},
  onCreateBot = () => {},
}: BotManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'General Assistant' as Bot['type'],
    selectionCriteria: [] as string[],
    isActive: true,
  });

  // Update form data when prefilledForm changes
  React.useEffect(() => {
    if (prefilledForm) {
      setFormData(prev => ({
        ...prev,
        ...prefilledForm,
        selectionCriteria: prefilledForm.selectionCriteria || [],
      }));
      setShowForm(true);
    }
  }, [prefilledForm]);

  const criteriaOptions = ['Scores', 'Resume', 'Experience', 'Skills'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    if (editingBot) {
      onEditBot(editingBot.id, formData);
      showToast('success', 'Bot updated successfully');
    } else {
      onAddBot(formData);
      showToast('success', 'Bot created successfully');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'General Assistant',
      selectionCriteria: [],
      isActive: true,
    });
    setShowForm(false);
    setEditingBot(null);
  };

  const handleEdit = (bot: Bot) => {
    setFormData({
      name: bot.name,
      description: bot.description,
      type: bot.type,
      selectionCriteria: bot.selectionCriteria,
      isActive: bot.isActive,
    });
    setEditingBot(bot);
    setShowForm(true);
  };

  const handleDelete = (bot: Bot) => {
    showConfirm(
      'Delete Bot',
      `Are you sure you want to delete ${bot.name}? This action cannot be undone.`,
      () => {
        onDeleteBot(bot.id);
        showToast('success', 'Bot deleted successfully');
      }
    );
  };

  const handleCriteriaChange = (criteria: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectionCriteria: checked
        ? [...prev.selectionCriteria, criteria]
        : prev.selectionCriteria.filter(c => c !== criteria)
    }));
  };

  const toggleBotStatus = (bot: Bot) => {
    onEditBot(bot.id, { ...bot, isActive: !bot.isActive });
    showToast('success', `Bot ${bot.isActive ? 'deactivated' : 'activated'} successfully`);
  };

  // Form filling function for AI assistant
  const handleFillForm = (fields: any) => {
    setFormData(prev => ({
      ...prev,
      name: fields.name || prev.name,
      description: fields.description || prev.description,
      type: fields.type || prev.type,
      selectionCriteria: fields.selectionCriteria || prev.selectionCriteria,
      isActive: fields.isActive !== undefined ? fields.isActive : prev.isActive,
    }));
    if (!showForm) setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Floating AI Command */}
      <FloatingAICommand
        onAddCommand={onAddCommand}
        onNavigate={onNavigate}
        onAddUser={onAddUser}
        onCreateBot={onCreateBot}
        showToast={showToast}
        currentPage="bots"
        formContext={{ type: 'bot', onFillForm: handleFillForm, availableFields: ['name', 'description', 'type', 'selectionCriteria', 'isActive'] }}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bot Management</h1>
          <p className="text-gray-600">Create and manage your AI assistants</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          <span>Create Bot</span>
        </button>
      </div>

      {/* Bot Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingBot ? 'Edit Bot' : 'Create New Bot'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="botName" className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Name *
                </label>
                <input
                  type="text"
                  id="botName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter bot name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="botType" className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Type *
                </label>
                <select
                  id="botType"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Bot['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="Customer Service">Customer Service</option>
                  <option value="Recruitment">Recruitment</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Email Assistant">Email Assistant</option>
                  <option value="General Assistant">General Assistant</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="botDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Bot Description *
              </label>
              <textarea
                id="botDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this bot does and its capabilities"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selection Criteria
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {criteriaOptions.map((criteria) => (
                  <label key={criteria} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.selectionCriteria.includes(criteria)}
                      onChange={(e) => handleCriteriaChange(criteria, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{criteria}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Status
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                {editingBot ? 'Update Bot' : 'Create Bot'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <div key={bot.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${bot.isActive ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <BotIcon className={bot.isActive ? 'text-purple-600' : 'text-gray-400'} size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{bot.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    bot.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {bot.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => toggleBotStatus(bot)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    bot.isActive ? 'text-green-600' : 'text-gray-400'
                  }`}
                  title={bot.isActive ? 'Deactivate bot' : 'Activate bot'}
                >
                  {bot.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                </button>
                <button
                  onClick={() => handleEdit(bot)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-gray-100"
                  title="Edit bot"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(bot)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-gray-100"
                  title="Delete bot"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Type</p>
                <p className="text-sm text-gray-600">{bot.type}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                <p className="text-sm text-gray-600 line-clamp-2">{bot.description}</p>
              </div>

              {bot.selectionCriteria.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Selection Criteria</p>
                  <div className="flex flex-wrap gap-1">
                    {bot.selectionCriteria.map((criteria) => (
                      <span
                        key={criteria}
                        className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                      >
                        {criteria}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created: {new Date(bot.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bots.length === 0 && (
        <div className="text-center py-12">
          <BotIcon className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bots created yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first AI assistant</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Your First Bot
          </button>
        </div>
      )}
    </div>
  );
}