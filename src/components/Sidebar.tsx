import React from 'react';
import { Page } from '../types';
import { Home, Users, Bot, Terminal, Menu, X } from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export default function Sidebar({ currentPage, onPageChange, isMobileMenuOpen, onToggleMobileMenu }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: Home },
    { id: 'users' as Page, label: 'Users', icon: Users },
    { id: 'bots' as Page, label: 'Bots', icon: Bot },
    { id: 'commands' as Page, label: 'AI Commands', icon: Terminal },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-900 text-white rounded-md"
        onClick={onToggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-blue-900 text-white transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
        <div className="p-6">
          <h1 className="text-xl font-bold mb-8">AI Assistant Hub</h1>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onPageChange(item.id);
                      onToggleMobileMenu();
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                      ${currentPage === item.id 
                        ? 'bg-blue-700 text-white' 
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}