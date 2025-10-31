
import React from 'react';
import { View } from '../types';
import Icon from './Icon';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  pendingTaskCount: number;
}

const NavItem: React.FC<{ iconName: string, label: string, isActive: boolean, onClick: () => void, badgeCount?: number }> = ({ iconName, label, isActive, onClick, badgeCount = 0 }) => {
  const activeClass = 'text-indigo-400';
  const inactiveClass = 'text-gray-400 hover:text-white';
  
  return (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center space-y-1 transition-colors ${isActive ? activeClass : inactiveClass}`}>
      {badgeCount > 0 && (
          <span className="absolute top-0 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {badgeCount}
          </span>
      )}
      <Icon name={iconName} className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, pendingTaskCount }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 z-20">
      <div className="max-w-4xl mx-auto h-full grid grid-cols-5 gap-2">
        <NavItem iconName="home" label="Home" isActive={currentView === 'home'} onClick={() => setCurrentView('home')} />
        <NavItem iconName="inbox" label="Inbox" isActive={currentView === 'inbox'} onClick={() => setCurrentView('inbox')} badgeCount={pendingTaskCount} />
        <NavItem iconName="calendar" label="Calendar" isActive={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} />
        <NavItem iconName="schedule" label="Schedule" isActive={currentView === 'schedule'} onClick={() => setCurrentView('schedule')} />
        <NavItem iconName="settings" label="Settings" isActive={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
      </div>
    </nav>
  );
};

export default BottomNav;