import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import ChatPanel from './ChatPanel';
import EmailDetail from './EmailDetail';
import SettingsPage from './SettingsPage';

export default function Layout({ user, onLogout, oauthSuccess }) {
  const [selectedCategory, setSelectedCategory] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-open settings when OAuth completes
  useEffect(() => {
    if (oauthSuccess) {
      setShowSettings(true);
    }
  }, [oauthSuccess]);

  const getCategoryTitle = () => {
    if (showSettings) return 'Settings';
    switch(selectedCategory) {
      case 'inbox': return 'Inbox';
      case 'important': return 'Important';
      case 'spam': return 'Spam';
      case 'newsletter': return 'Newsletters';
      case 'promotional': return 'Promotions';
      case 'social': return 'Social';
      default: return 'Inbox';
    }
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setShowSettings(false);
    setSelectedEmail(null);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
    setSelectedEmail(null);
  };

  return (
    <div className="flex h-screen w-screen bg-[#1f1f1f]">
      {/* Success Notification */}
      {oauthSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Gmail connected successfully!</span>
        </div>
      )}

      {/* Left Sidebar - Navigation */}
      <Sidebar 
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onShowSettings={handleShowSettings}
        showSettings={showSettings}
      />

      {/* Center - Email List */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#2d2d2d] border-b border-[#3c3c3c] px-6 py-3 flex items-center justify-between">
          <h1 className="text-xl font-normal text-gray-200">
            {getCategoryTitle()}
          </h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Chat
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#3c3c3c] rounded transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-gray-300 text-sm">{user?.name || user?.email}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2d2d2d] border border-[#3c3c3c] rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-[#3c3c3c]">
                    <p className="text-sm font-medium text-gray-200">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleShowSettings();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#3c3c3c] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#3c3c3c] transition-colors flex items-center gap-2 border-t border-[#3c3c3c]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Settings, Email Detail, or Email List */}
          {showSettings ? (
            <SettingsPage 
              user={user}
              onBack={() => setShowSettings(false)}
            />
          ) : selectedEmail ? (
            <EmailDetail 
              email={selectedEmail} 
              onBack={() => setSelectedEmail(null)}
            />
          ) : (
            <EmailList 
              category={selectedCategory}
              onSelectEmail={setSelectedEmail}
              userId={user?.id || user?.email}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Chat Panel */}
      <ChatPanel 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)}
        userId={user?.id || user?.email}
      />
    </div>
  );
}

