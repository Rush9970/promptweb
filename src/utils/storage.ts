import { User, Bot, Command } from '../types';

const STORAGE_KEYS = {
  users: 'ai-hub-users',
  bots: 'ai-hub-bots',
  commands: 'ai-hub-commands',
};

export const storage = {
  getUsers: (): User[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.users);
    return stored ? JSON.parse(stored) : [];
  },

  setUsers: (users: User[]): void => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  },

  getBots: (): Bot[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.bots);
    return stored ? JSON.parse(stored) : [];
  },

  setBots: (bots: Bot[]): void => {
    localStorage.setItem(STORAGE_KEYS.bots, JSON.stringify(bots));
  },

  getCommands: (): Command[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.commands);
    return stored ? JSON.parse(stored) : [];
  },

  setCommands: (commands: Command[]): void => {
    localStorage.setItem(STORAGE_KEYS.commands, JSON.stringify(commands));
  },

  addCommand: (command: Command): void => {
    const commands = storage.getCommands();
    commands.unshift(command);
    storage.setCommands(commands.slice(0, 50)); // Keep only last 50 commands
  },
};