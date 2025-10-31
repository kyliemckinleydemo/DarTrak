
import React from 'react';
import Icon from './Icon';

interface SyncPromptProps {
  onSync: () => void;
  onDismiss: () => void;
  isLoading: boolean;
}

const SyncPrompt: React.FC<SyncPromptProps> = ({ onSync, onDismiss, isLoading }) => {
  return (
    <div className="bg-indigo-600/20 border border-indigo-500/50 text-indigo-200 px-4 py-3 rounded-lg relative mx-4 mb-4" role="alert">
      <div className="flex items-center">
        <Icon name="bell" className="w-6 h-6 mr-3 text-indigo-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <strong className="font-bold">Sync Recommended</strong>
          <span className="block sm:inline sm:ml-2 text-indigo-300">It's been a while. Sync to get the latest tasks.</span>
        </div>
        <div className="flex items-center ml-4">
            <button
              onClick={onSync}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Syncing...' : 'Sync Now'}
            </button>
            <button onClick={onDismiss} className="ml-2 p-2 rounded-full hover:bg-indigo-500/30">
              <Icon name="x-mark" className="w-5 h-5 text-indigo-300/70 hover:text-white" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default SyncPrompt;
