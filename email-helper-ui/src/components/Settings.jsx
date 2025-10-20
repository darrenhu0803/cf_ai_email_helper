import { useState, useEffect } from 'react';

export default function Settings({ user, onClose }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

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
        // Open OAuth flow in popup or redirect
        window.location.href = data.authUrl;
      } else {
        alert('Failed to start OAuth: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
      alert('Failed to connect Gmail. Make sure OAuth credentials are configured.');
    }
  };

  const syncGmail = async () => {
    try {
      setSyncing(true);
      setSyncStatus('Syncing emails from Gmail...');
      
      const response = await fetch('http://localhost:8787/api/email-providers/gmail/sync', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(`✓ Synced ${data.synced} emails successfully!`);
        setTimeout(() => setSyncStatus(null), 5000);
      } else {
        setSyncStatus('✗ Sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to sync Gmail:', error);
      setSyncStatus('✗ Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const gmailConnected = providers.some(p => p.provider === 'gmail');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#3c3c3c] p-6 flex items-center justify-between sticky top-0 bg-[#2d2d2d]">
          <h2 className="text-2xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#3c3c3c] rounded transition-colors text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
            <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#3c3c3c]">
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

          {/* Email Providers */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Connected Email Accounts</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Gmail */}
                <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#3c3c3c]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M24 12.073c0-.768-.071-1.5-.197-2.21H12v4.177h6.728a5.76 5.76 0 01-2.494 3.776v3.02h4.033c2.36-2.173 3.73-5.378 3.73-8.763z"/>
                          <path fill="#34A853" d="M12 24c3.366 0 6.19-1.114 8.254-3.017l-4.033-3.13c-1.118.748-2.549 1.19-4.221 1.19-3.245 0-5.992-2.19-6.972-5.137H.89v3.227A11.996 11.996 0 0012 24z"/>
                          <path fill="#FBBC05" d="M5.028 14.43a7.21 7.21 0 010-4.86V6.344H.891a11.996 11.996 0 000 10.77l4.137-3.227z"/>
                          <path fill="#4285F4" d="M12 4.773c1.83 0 3.469.63 4.76 1.864l3.57-3.57C18.185 1.19 15.361 0 12 0A11.996 11.996 0 00.89 6.344l4.137 3.227C6.008 6.963 8.755 4.773 12 4.773z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200">Gmail</p>
                        {gmailConnected ? (
                          <p className="text-sm text-green-400">✓ Connected</p>
                        ) : (
                          <p className="text-sm text-gray-500">Not connected</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {gmailConnected ? (
                        <button
                          onClick={syncGmail}
                          disabled={syncing}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded transition-colors flex items-center gap-2"
                        >
                          {syncing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Syncing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Sync Now
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={connectGmail}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {syncStatus && (
                    <div className={`mt-3 p-3 rounded ${syncStatus.startsWith('✓') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                      {syncStatus}
                    </div>
                  )}
                </div>

                {/* Outlook (Coming Soon) */}
                <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#3c3c3c] opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0078D4] rounded flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.88 12.04q0 .45-.11.87-.11.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.51.3.51.85zm-6.28-4.53v-.02l-.01-.01-.01-.01-.75-.38q-5.77-3-5.99-3.11-.03-.01-.09-.06l-.12-.05H7.88v9.48q0 .23.13.42.14.18.35.3l5.88 3.18q.06.04.12.04.05 0 .09-.03l5.95-3.19q.21-.12.34-.3.14-.19.14-.42V7.47zm1.27 9.13v-6.4l-5.15 2.73 5.15 3.67zm-5.88-3.72l-5.02-2.73v6.43l5.02-3.7zm-5.88 3.73L13.38 20.5V16.83l-5.15 3.67zm13.88-7.3l-5.88 3.15 5.88 4.17v-7.32z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200">Outlook</p>
                        <p className="text-sm text-gray-500">Coming soon</p>
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
              </div>
            )}
          </div>

          {/* Setup Instructions */}
          {!gmailConnected && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-300 mb-2">First-time setup required</h4>
                  <p className="text-sm text-blue-200 mb-2">
                    To connect Gmail, you need to set up OAuth credentials first:
                  </p>
                  <ol className="text-sm text-blue-200 list-decimal list-inside space-y-1">
                    <li>Create a Google Cloud Project</li>
                    <li>Enable Gmail API</li>
                    <li>Create OAuth 2.0 credentials</li>
                    <li>Add credentials to worker configuration</li>
                  </ol>
                  <p className="text-sm text-blue-300 mt-3">
                    📖 See <code className="bg-blue-500/20 px-1 py-0.5 rounded">OAUTH_SETUP.md</code> for detailed instructions
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Connected Providers List */}
          {providers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Your Connections</h3>
              <div className="space-y-2">
                {providers.map((provider, index) => (
                  <div key={index} className="bg-[#1f1f1f] rounded p-3 border border-[#3c3c3c] flex items-center justify-between">
                    <div>
                      <p className="text-gray-200 font-medium capitalize">{provider.provider}</p>
                      <p className="text-sm text-gray-400">{provider.email}</p>
                      <p className="text-xs text-gray-500">
                        Connected {new Date(provider.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-green-400">✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#3c3c3c] p-6 flex justify-end sticky bottom-0 bg-[#2d2d2d]">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

