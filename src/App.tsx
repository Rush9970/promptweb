import React, { useState, useEffect } from 'react';
import { Page, User, Bot, Command, Stats } from './types';
import { storage } from './utils/storage';
import { sampleUsers, sampleBots, sampleCommands } from './data/sampleData';
import { validateEnvironment } from './config/environment';

// Components
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import FloatingAICommand from './components/FloatingAICommand';

// Pages
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import BotManagement from './pages/BotManagement';
import AICommandCenter from './pages/AICommandCenter';

interface ToastState {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
}

interface ConfirmState {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'success', message: '' });
  const [confirm, setConfirm] = useState<ConfirmState>({ show: false, title: '', message: '', onConfirm: () => {} });
  const [prefilledUserForm, setPrefilledUserForm] = useState<Partial<User> | undefined>();
  const [prefilledBotForm, setPrefilledBotForm] = useState<Partial<Bot> | undefined>();

  // Initialize data from localStorage or use sample data
  useEffect(() => {
    // Validate environment variables
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.warn('Missing environment variables:', envValidation.missingVars);
      console.log('Note: The application will work with basic command parsing without API keys.');
    }

    const storedUsers = storage.getUsers();
    const storedBots = storage.getBots();
    const storedCommands = storage.getCommands();

    setUsers(storedUsers.length > 0 ? storedUsers : sampleUsers);
    setBots(storedBots.length > 0 ? storedBots : sampleBots);
    setCommands(storedCommands.length > 0 ? storedCommands : sampleCommands);

    // Save sample data to localStorage if none exists
    if (storedUsers.length === 0) storage.setUsers(sampleUsers);
    if (storedBots.length === 0) storage.setBots(sampleBots);
    if (storedCommands.length === 0) storage.setCommands(sampleCommands);
  }, []);

  // Calculate stats
  const stats: Stats = {
    totalUsers: users.length,
    totalBots: bots.length,
    activeBots: bots.filter(bot => bot.isActive).length,
    totalCommands: commands.length,
  };

  // Toast functions
  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ show: true, type, message });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Confirm dialog functions
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirm({ show: true, title, message, onConfirm });
  };

  const hideConfirm = () => {
    setConfirm(prev => ({ ...prev, show: false }));
  };

  const handleConfirm = () => {
    confirm.onConfirm();
    hideConfirm();
  };

  // Navigation
  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    // Clear prefilled forms when navigating
    setPrefilledUserForm(undefined);
    setPrefilledBotForm(undefined);
  };

  const handleNavigate = (page: string) => {
    handlePageChange(page as Page);
  };

  // User management
  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    storage.setUsers(updatedUsers);
    setPrefilledUserForm(undefined);
  };

  const handleEditUser = (id: string, userData: Omit<User, 'id' | 'createdAt'>) => {
    const updatedUsers = users.map(user =>
      user.id === id ? { ...user, ...userData } : user
    );
    setUsers(updatedUsers);
    storage.setUsers(updatedUsers);
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    storage.setUsers(updatedUsers);
  };

  // Bot management
  const handleAddBot = (botData: Omit<Bot, 'id' | 'createdAt'>) => {
    const newBot: Bot = {
      ...botData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updatedBots = [...bots, newBot];
    setBots(updatedBots);
    storage.setBots(updatedBots);
    setPrefilledBotForm(undefined);
  };

  const handleEditBot = (id: string, botData: Omit<Bot, 'id' | 'createdAt'>) => {
    const updatedBots = bots.map(bot =>
      bot.id === id ? { ...bot, ...botData } : bot
    );
    setBots(updatedBots);
    storage.setBots(updatedBots);
  };

  const handleDeleteBot = (id: string) => {
    const updatedBots = bots.filter(bot => bot.id !== id);
    setBots(updatedBots);
    storage.setBots(updatedBots);
  };

  // Command management
  const handleAddCommand = (command: Command) => {
    const updatedCommands = [command, ...commands];
    setCommands(updatedCommands);
    storage.addCommand(command);
  };

  // AI Command handlers
  const handleAddUserFromCommand = (userData: any) => {
    setPrefilledUserForm(userData);
    handlePageChange('users');
  };

  const handleCreateBotFromCommand = (botData: any) => {
    const newBot = {
      ...botData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updatedBots = [...bots, newBot];
    setBots(updatedBots);
    storage.setBots(updatedBots);
    showToast('success', `Bot "${newBot.name}" created successfully!`);
    setPrefilledBotForm(undefined);
    handlePageChange('bots');
  };

  // Close mobile menu on page change
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        handlePageChange('commands');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats}
            users={users}
            bots={bots}
            commands={commands}
            onPageChange={handleNavigate}
          />
        );
      case 'users':
        return (
          <UserManagement
            users={users}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            showToast={showToast}
            showConfirm={showConfirm}
            prefilledForm={prefilledUserForm}
          />
        );
      case 'bots':
        return (
          <BotManagement
            bots={bots}
            onAddBot={handleAddBot}
            onEditBot={handleEditBot}
            onDeleteBot={handleDeleteBot}
            showToast={showToast}
            showConfirm={showConfirm}
            prefilledForm={prefilledBotForm}
          />
        );
      case 'commands':
        return (
          <AICommandCenter
            commands={commands}
            onAddCommand={handleAddCommand}
            onNavigate={handleNavigate}
            onAddUser={handleAddUserFromCommand}
            onCreateBot={handleCreateBotFromCommand}
            showToast={showToast}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={toggleMobileMenu}
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
            <div className="max-w-7xl mx-auto">
              {renderCurrentPage()}
            </div>
          </div>
        </main>
      </div>

      {/* Floating AI Command Center - global */}
      <FloatingAICommand
        onAddCommand={handleAddCommand}
        onNavigate={handleNavigate}
        onAddUser={handleAddUserFromCommand}
        onCreateBot={handleCreateBotFromCommand}
        showToast={showToast}
        currentPage={currentPage}
      />

      {/* Toast notifications */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
        />
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={confirm.show}
        title={confirm.title}
        message={confirm.message}
        onConfirm={handleConfirm}
        onCancel={hideConfirm}
      />
    </div>
  );
}