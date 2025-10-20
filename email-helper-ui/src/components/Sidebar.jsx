export default function Sidebar({ selectedCategory, onSelectCategory }) {
  const categories = [
    { id: 'inbox', name: 'Inbox', icon: 'inbox' },
    { id: 'important', name: 'Important', icon: 'star' },
    { id: 'spam', name: 'Spam', icon: 'warning' },
    { id: 'newsletter', name: 'Newsletters', icon: 'newspaper' },
    { id: 'promotional', name: 'Promotions', icon: 'tag' },
    { id: 'social', name: 'Social', icon: 'users' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      inbox: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />,
      star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
      warning: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
      newspaper: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />,
      tag: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />,
      users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    };
    return icons[iconName];
  };

  return (
    <div className="w-64 flex-shrink-0 bg-[#171717] border-r border-[#3c3c3c] flex flex-col">
      {/* Logo/Header */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 text-white">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={2} />
            <path d="M3 7l9 6 9-6" strokeWidth={2} strokeLinecap="round" />
          </svg>
          <h2 className="text-xl font-semibold">Email Helper</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors mb-0.5
              ${selectedCategory === category.id 
                ? 'bg-[#2d2d2d] text-white' 
                : 'text-gray-400 hover:bg-[#2d2d2d] hover:text-gray-200'
              }
            `}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getIcon(category.icon)}
            </svg>
            <span className="text-sm">{category.name}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#3c3c3c]">
        <p className="text-xs text-gray-500">Powered by Cloudflare AI</p>
      </div>
    </div>
  );
}

