import { useState, useEffect } from 'react';

export default function SettingsPage({ user, onBack }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await fetch('http://localhost:8787/api/email-providers', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectGmail = async () => {
    try {
      const response = await fetch('http://localhost:8787/api/oauth/gmail/start', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        alert(data.error || 'Failed to start OAuth flow');
      }
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
      alert('Connection failed. Make sure OAuth credentials are configured.');
    }
  };

  const syncGmail = async () => {
    setSyncing(true);
    setSyncStatus(null);
    
    try {
      const response = await fetch('http://localhost:8787/api/email-providers/gmail/sync', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus({
          type: 'success',
          message: `✅ Synced ${data.synced} emails successfully!`
        });
      } else {
        setSyncStatus({
          type: 'error',
          message: data.error || 'Sync failed'
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus({
        type: 'error',
        message: 'Sync failed. Please try again.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const isGmailConnected = providers.some(p => p.provider === 'gmail');

  return (
    <div className="flex-1 flex flex-col bg-[#1f1f1f]">
      {/* Header */}
      <div className="border-b border-[#3c3c3c] p-4 flex items-center gap-4 bg-[#2d2d2d]">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#3c3c3c] rounded transition-colors text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-normal text-gray-200">Settings</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#1f1f1f]">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* User Info */}
          <div className="bg-[#2d2d2d] border border-[#3c3c3c] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <p className="text-gray-200">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-gray-200">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Email Providers */}
          <div className="bg-[#2d2d2d] border border-[#3c3c3c] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Connected Email Accounts</h3>
            
            {loading ? (
              <div className="text-gray-400 text-center py-4">Loading...</div>
            ) : (
              <div className="space-y-4">
                {/* Gmail Connection */}
                <div className="flex items-center justify-between p-4 bg-[#1f1f1f] border border-[#3c3c3c] rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Gmail</h4>
                      {isGmailConnected ? (
                        <p className="text-sm text-green-400">
                          ✓ Connected: {providers.find(p => p.provider === 'gmail')?.email}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">Not connected</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isGmailConnected ? (
                      <button
                        onClick={syncGmail}
                        disabled={syncing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {syncing ? 'Syncing...' : 'Sync Now'}
                      </button>
                    ) : (
                      <button
                        onClick={connectGmail}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Connect Gmail
                      </button>
                    )}
                  </div>
                </div>

                {/* Sync Status */}
                {syncStatus && (
                  <div className={`p-4 rounded-lg ${
                    syncStatus.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                      : 'bg-red-500/10 border border-red-500/30 text-red-300'
                  }`}>
                    {syncStatus.message}
                  </div>
                )}

                {/* Coming Soon */}
                <div className="flex items-center justify-between p-4 bg-[#1f1f1f] border border-[#3c3c3c] rounded-lg opacity-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V4.13q0-.46.33-.8.33-.32.8-.32h13.75q.46 0 .8.33.32.33.32.8zm-19 7v1.38q0 .08.07.15.07.07.15.07h11.75q.08 0 .15-.07.07-.07.07-.15V19z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Outlook</h4>
                      <p className="text-sm text-gray-400">Coming soon</p>
                    </div>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-600 text-gray-400 rounded cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Setup Instructions */}
          {!isGmailConnected && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-blue-300 font-semibold mb-2">First Time Setup</h4>
                  <p className="text-blue-200/80 text-sm mb-3">
                    To connect your Gmail account, the app administrator needs to configure Google OAuth credentials first.
                  </p>
                  <p className="text-blue-200/80 text-sm">
                    See <code className="bg-blue-500/20 px-2 py-1 rounded">OAUTH_SETUP.md</code> for detailed instructions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

