import { useState } from 'react';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import ChatPanel from './ChatPanel';
import EmailDetail from './EmailDetail';

export default function Layout() {
  const [selectedCategory, setSelectedCategory] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const getCategoryTitle = () => {
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

  return (
    <div className="flex h-screen w-screen bg-[#1f1f1f]">
      {/* Left Sidebar - Navigation */}
      <Sidebar 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
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
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Email List or Detail View */}
          {selectedEmail ? (
            <EmailDetail 
              email={selectedEmail} 
              onBack={() => setSelectedEmail(null)}
            />
          ) : (
            <EmailList 
              category={selectedCategory}
              onSelectEmail={setSelectedEmail}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Chat Panel */}
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

