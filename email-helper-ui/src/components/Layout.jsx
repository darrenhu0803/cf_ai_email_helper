import { useState } from 'react';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import ChatPanel from './ChatPanel';
import EmailDetail from './EmailDetail';

console.log('=== LAYOUT.JSX LOADING ===');
console.log('Sidebar:', Sidebar);
console.log('EmailList:', EmailList);
console.log('ChatPanel:', ChatPanel);
console.log('EmailDetail:', EmailDetail);

export default function Layout() {
  console.log('=== LAYOUT COMPONENT RENDERING ===');
  
  const [selectedCategory, setSelectedCategory] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation */}
      <Sidebar 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Center - Email List */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            {selectedCategory === 'inbox' ? 'Inbox' : 
             selectedCategory === 'important' ? 'Important' :
             selectedCategory === 'spam' ? 'Spam' :
             selectedCategory === 'newsletter' ? 'Newsletters' :
             'All Emails'}
          </h1>
          
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {chatOpen ? 'Close Chat' : 'Open Chat'}
          </button>
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

