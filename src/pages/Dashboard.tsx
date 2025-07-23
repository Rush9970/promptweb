import React from 'react';
import { Users, Bot, Activity, Zap, Plus, ArrowRight } from 'lucide-react';
import { Stats, User, Bot as BotType, Command } from '../types';

interface DashboardProps {
  stats: Stats;
  users: User[];
  bots: BotType[];
  commands: Command[];
  onPageChange: (page: string) => void;
}

export default function Dashboard({ stats, users, bots, commands, onPageChange }: DashboardProps) {
  const recentActivity = [
    ...commands.slice(0, 3).map(cmd => ({
      id: cmd.id,
      type: 'command',
      description: `Executed: ${cmd.command}`,
      timestamp: cmd.timestamp,
    })),
    ...users.slice(0, 2).map(user => ({
      id: user.id,
      type: 'user',
      description: `New user added: ${user.name}`,
      timestamp: user.createdAt,
    })),
    ...bots.slice(0, 2).map(bot => ({
      id: bot.id,
      type: 'bot',
      description: `Bot created: ${bot.name}`,
      timestamp: bot.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AI Assistant Hub</h1>
        <p className="text-gray-600">Manage your AI assistants, users, and automate your workflow.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-600 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bots</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBots}</p>
            </div>
            <Bot className="text-purple-600" size={32} />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+8%</span>
            <span className="text-gray-600 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bots</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeBots}</p>
            </div>
            <Activity className="text-green-600" size={32} />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+5%</span>
            <span className="text-gray-600 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commands Executed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCommands}</p>
            </div>
            <Zap className="text-yellow-600" size={32} />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+24%</span>
            <span className="text-gray-600 ml-2">from last month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onPageChange('users')}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Plus className="text-blue-600" size={20} />
              <div className="text-left">
                <p className="font-medium text-gray-900">Add New User</p>
                <p className="text-sm text-gray-600">Create a new user account</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400" size={20} />
          </button>
          
          <button
            onClick={() => onPageChange('bots')}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Plus className="text-purple-600" size={20} />
              <div className="text-left">
                <p className="font-medium text-gray-900">Create New Bot</p>
                <p className="text-sm text-gray-600">Set up a new AI assistant</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400" size={20} />
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                activity.type === 'command' ? 'bg-yellow-500' :
                activity.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}