import { useState, useEffect } from 'react';

export default function SettingsPage({ user, onBack }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
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
        alert('Failed to start OAuth: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
      alert('Connection failed. Please try again.');
    }
  };

  const syncGmail = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      
      const response = await fetch('http://localhost:8787/api/email-providers/gmail/sync', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setSyncResult({
          success: true,
          message: `Successfully synced ${data.synced} emails!`,
        });
      } else {
        setSyncResult({
          success: false,
          message: data.error || 'Sync failed',
        });
      }
    } catch (error) {
      console.error('Failed to sync Gmail:', error);
      setSyncResult({
        success: false,
        message: 'Sync failed. Please try again.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const gmailConnected = providers.find(p => p.provider === 'gmail');

  return (
    <div className="flex-1 flex flex-col bg-[#1f1f1f] overflow-hidden">
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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Account Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Account</h3>
            <div className="bg-[#2d2d2d] rounded-lg border border-[#3c3c3c] p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-200">{user?.name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Email Accounts */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Connected Email Accounts</h3>
            
            {loading ? (
              <div className="bg-[#2d2d2d] rounded-lg border border-[#3c3c3c] p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-400">Loading...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Gmail Card */}
                <div className="bg-[#2d2d2d] rounded-lg border border-[#3c3c3c] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-7 h-7" viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M5 5v14h14V5H5zm12.5 7.5l-4.5 3.5V9l4.5 3.5z"/>
                          <path fill="#FBBC05" d="M19 5l-7 5.5L5 5h14z"/>
                          <path fill="#34A853" d="M5 19l7-5.5L19 19H5z"/>
                          <path fill="#4285F4" d="M5 5l7 5.5V19L5 19V5z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Gmail</h4>
                        {gmailConnected ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            <p className="text-sm text-gray-400">Connected as {gmailConnected.email}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Not connected</p>
                        )}
                      </div>
                    </div>

                    {gmailConnected ? (
                      <button
                        onClick={syncGmail}
                        disabled={syncing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center gap-2"
                      >
                        {syncing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Syncing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Sync Now
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={connectGmail}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Connect Gmail
                      </button>
                    )}
                  </div>

                  {gmailConnected && (
                    <div className="pt-4 border-t border-[#3c3c3c] text-sm text-gray-400">
                      <p>Connected: {new Date(gmailConnected.connectedAt).toLocaleDateString()}</p>
                    </div>
                  )}

                  {syncResult && (
                    <div className={`mt-4 p-3 rounded ${syncResult.success ? 'bg-green-500/10 border border-green-500/30 text-green-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
                      {syncResult.message}
                    </div>
                  )}
                </div>

                {/* Coming Soon Cards */}
                <div className="bg-[#2d2d2d] rounded-lg border border-[#3c3c3c] p-6 opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0078D4] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">O</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-200">Outlook</h4>
                        <p className="text-sm text-gray-400">Coming soon</p>
                      </div>
                    </div>
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-700 text-gray-500 rounded cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Setup Instructions */}
          {!gmailConnected && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Setup Required
              </h4>
              <div className="text-sm text-blue-200 space-y-2">
                <p>To connect Gmail, you need to set up Google OAuth credentials:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Create a Google Cloud Project</li>
                  <li>Enable Gmail API</li>
                  <li>Create OAuth 2.0 credentials</li>
                  <li>Add credentials to your worker environment</li>
                </ol>
                <p className="mt-3">
                  📖 <a href="#" className="underline hover:text-blue-100">See OAUTH_SETUP.md</a> for detailed instructions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

