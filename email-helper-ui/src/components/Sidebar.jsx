export default function Sidebar({ selectedCategory, onSelectCategory }) {
  const categories = [
    { id: 'inbox', name: 'Inbox', icon: '📥', count: null },
    { id: 'important', name: 'Important', icon: '⭐', count: null },
    { id: 'spam', name: 'Spam', icon: '🚫', count: null },
    { id: 'newsletter', name: 'Newsletters', icon: '📰', count: null },
    { id: 'promotional', name: 'Promotional', icon: '🏷️', count: null },
    { id: 'social', name: 'Social', icon: '👥', count: null },
  ];

  return (
    <div className="w-64 bg-white border-r flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>✉️</span>
          Email Helper
        </h2>
        <p className="text-sm text-gray-500 mt-1">AI-Powered Inbox</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
              ${selectedCategory === category.id 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <span className="text-xl">{category.icon}</span>
            <span className="flex-1 text-left">{category.name}</span>
            {category.count !== null && (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {category.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t text-center text-sm text-gray-500">
        <p>Powered by Cloudflare AI</p>
      </div>
    </div>
  );
}

