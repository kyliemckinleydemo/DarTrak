import React from 'react';
import { View } from '../types';
import Icon from './Icon';

interface HeaderProps {
  currentView: View;
  onSync: () => void;
  isLoading: boolean;
  lastSync: string | null;
}

const viewTitles: Record<View, string> = {
  home: 'Dashboard',
  tasks: 'All Tasks',
  schedule: 'Class Schedule',
  calendar: 'Calendar',
  settings: 'Settings',
  inbox: 'Review New Tasks',
  help: 'Help & FAQ',
};

const Header: React.FC<HeaderProps> = ({ currentView, onSync, isLoading, lastSync }) => {
  const getSyncTime = () => {
    if (!lastSync) return 'Never';
    const diff = new Date().getTime() - new Date(lastSync).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };
  
  return (
    <header className="bg-gray-900/70 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-gray-700">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">{viewTitles[currentView]}</h1>
        <div className="flex items-center space-x-4">
          {(currentView === 'home' || currentView === 'inbox') && (
            <button
              onClick={onSync}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              <Icon name="sync" className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing...' : `Synced: ${getSyncTime()}`}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;