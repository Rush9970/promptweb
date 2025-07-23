export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Viewer';
  department: string;
  createdAt: string;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  type: 'Customer Service' | 'Recruitment' | 'Technical Support' | 'Email Assistant' | 'General Assistant';
  selectionCriteria: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Command {
  id: string;
  command: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
}

export interface Stats {
  totalUsers: number;
  totalBots: number;
  activeBots: number;
  totalCommands: number;
}

export type Page = 'dashboard' | 'users' | 'bots' | 'commands';

export interface ActionObject {
  action: string;
  target?: string;
  fields?: Record<string, any>;
  message?: string;
}