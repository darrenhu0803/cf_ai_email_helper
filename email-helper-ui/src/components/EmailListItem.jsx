export default function EmailListItem({ email, onClick }) {
  const categoryColors = {
    important: 'bg-yellow-500/20 text-yellow-300',
    spam: 'bg-red-500/20 text-red-300',
    newsletter: 'bg-blue-500/20 text-blue-300',
    promotional: 'bg-green-500/20 text-green-300',
    social: 'bg-purple-500/20 text-purple-300',
    other: 'bg-gray-500/20 text-gray-400',
  };

  const categoryIcons = {
    important: '⭐',
    spam: '⚠️',
    newsletter: '📰',
    promotional: '🏷️',
    social: '👥',
    other: '📧',
  };

  const categoryColor = categoryColors[email.category] || categoryColors.other;
  const categoryIcon = categoryIcons[email.category] || categoryIcons.other;

  function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const month = date.toLocaleDateString('en', { month: 'short' });
    const day = date.getDate();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    // If this year, show "Oct 16"
    if (date.getFullYear() === now.getFullYear()) {
      return `${month} ${day}`;
    }
    
    // Otherwise show year
    return `${month} ${day}, ${date.getFullYear()}`;
  }

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center px-4 py-2 cursor-pointer transition-colors border-b border-[#3c3c3c]
        ${email.read 
          ? 'hover:bg-[#2d2d2d]' 
          : 'bg-[#2a2a2a] hover:bg-[#333333]'
        }
      `}
    >
      {/* Star Icon */}
      <div className="flex items-center mr-2">
        <button className="p-1 hover:bg-[#3c3c3c] rounded transition-colors">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      {/* Category Badge */}
      <div className={`flex items-center justify-center w-6 h-6 rounded text-xs mr-3 ${categoryColor}`}>
        {categoryIcon}
      </div>

      {/* Sender Name */}
      <div className={`w-48 flex-shrink-0 truncate text-sm ${!email.read ? 'font-bold text-white' : 'text-gray-300'}`}>
        {email.from || 'Unknown Sender'}
      </div>

      {/* Subject and Preview */}
      <div className="flex-1 flex items-baseline gap-2 min-w-0 overflow-hidden">
        <span className={`text-sm truncate ${!email.read ? 'font-bold text-white' : 'text-gray-300'}`}>
          {email.subject || '(no subject)'}
        </span>
        <span className="text-sm text-gray-500 truncate">
          — {email.summary || email.content?.substring(0, 100) || 'No preview'}
        </span>
      </div>

      {/* Action Items Indicator */}
      {email.actionItems && email.actionItems.length > 0 && (
        <div className="flex items-center mr-3">
          <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">
            {email.actionItems.length} todo
          </span>
        </div>
      )}

      {/* Time */}
      <div className={`text-xs flex-shrink-0 w-20 text-right ${!email.read ? 'font-semibold text-gray-300' : 'text-gray-500'}`}>
        {formatTime(email.receivedAt || Date.now())}
      </div>
    </div>
  );
}

