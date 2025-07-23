import { User, Bot, Command } from '../types';

export const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'Admin',
    department: 'IT Department',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@company.com',
    role: 'User',
    department: 'Marketing',
    createdAt: '2024-01-16',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@company.com',
    role: 'Viewer',
    department: 'Sales',
    createdAt: '2024-01-17',
  },
];

export const sampleBots: Bot[] = [
  {
    id: '1',
    name: 'CustomerBot',
    description: 'Customer service assistance bot that handles common inquiries and support tickets',
    type: 'Customer Service',
    selectionCriteria: ['Scores', 'Experience'],
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'RecruiterBot',
    description: 'Automated candidate screening and recruitment assistance',
    type: 'Recruitment',
    selectionCriteria: ['Scores', 'Resume', 'Experience', 'Skills'],
    isActive: true,
    createdAt: '2024-01-12',
  },
  {
    id: '3',
    name: 'TechBot',
    description: 'Technical support assistant for IT-related queries',
    type: 'Technical Support',
    selectionCriteria: ['Experience', 'Skills'],
    isActive: false,
    createdAt: '2024-01-14',
  },
];

export const sampleCommands: Command[] = [
  {
    id: '1',
    command: 'Create a bot named CustomerBot for handling support tickets',
    timestamp: '2024-01-20 10:30:00',
    status: 'success',
  },
  {
    id: '2',
    command: 'Add a user named John with email john@company.com and role admin',
    timestamp: '2024-01-20 11:45:00',
    status: 'success',
  },
  {
    id: '3',
    command: 'Show all active bots',
    timestamp: '2024-01-20 14:20:00',
    status: 'success',
  },
];

export const exampleCommands = [
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