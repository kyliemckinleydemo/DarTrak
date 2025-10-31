import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import Icon from './Icon';

interface GmailStatus {
  configured: boolean;
  connected: boolean;
  email: string | null;
  message?: string;
}

export default function GmailConnect() {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    checkStatus();

    // Check for OAuth callback success/error in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('gmail_connected') === 'true') {
      // Remove query param and refresh status
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(checkStatus, 1000);
    } else if (urlParams.get('gmail_error')) {
      alert(`Gmail connection failed: ${urlParams.get('gmail_error')}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/auth/gmail/status');
      setStatus(data);
    } catch (error) {
      console.error('Error checking Gmail status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const { data } = await apiClient.get('/api/auth/gmail/connect');
      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error('Error connecting Gmail:', error);
      alert(error.response?.data?.error || 'Failed to connect Gmail');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Gmail? You will need to re-authorize to sync emails.')) {
      return;
    }

    try {
      setDisconnecting(true);
      await apiClient.post('/api/auth/gmail/disconnect');
      await checkStatus();
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      alert('Failed to disconnect Gmail');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  // Gmail OAuth not configured on server
  if (!status.configured) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start space-x-3">
          <Icon name="inbox" className="w-6 h-6 text-gray-400 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Gmail Integration</h3>
            <p className="text-sm text-gray-400 mb-3">
              {status.message || 'Gmail OAuth is not configured on the server.'}
            </p>
            <div className="bg-gray-900 border border-gray-700 rounded p-3">
              <p className="text-xs text-gray-500 mb-2">The app is currently using mock email data for demonstration purposes.</p>
              <p className="text-xs text-gray-500">
                To enable real Gmail integration, ask your administrator to configure Gmail OAuth credentials in the server environment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gmail connected
  if (status.connected) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Icon name="inbox" className="w-6 h-6 text-green-500 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Gmail Connected</h3>
              <p className="text-sm text-gray-400 mb-2">
                Connected to: <span className="text-indigo-400">{status.email}</span>
              </p>
              <p className="text-xs text-gray-500">
                Your emails will be synced automatically when you trigger a sync.
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      </div>
    );
  }

  // Gmail not connected
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Icon name="inbox" className="w-6 h-6 text-gray-400 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Connect Gmail</h3>
            <p className="text-sm text-gray-400 mb-3">
              Connect your school Gmail to automatically extract tasks from professor emails.
            </p>
            <ul className="text-xs text-gray-500 space-y-1 mb-4">
              <li>• Read-only access to your emails</li>
              <li>• Only fetches emails from the last 30 days</li>
              <li>• Filters by your school email domain</li>
              <li>• AI extracts assignments and deadlines</li>
            </ul>
          </div>
        </div>
      </div>
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {connecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Icon name="inbox" className="w-5 h-5" />
            <span>Connect Gmail Account</span>
          </>
        )}
      </button>
    </div>
  );
}
