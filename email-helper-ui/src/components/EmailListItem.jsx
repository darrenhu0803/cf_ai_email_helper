export default function EmailListItem({ email, onClick }) {
  const categoryColors = {
    important: 'bg-red-100 text-red-700',
    spam: 'bg-gray-100 text-gray-700',
    newsletter: 'bg-blue-100 text-blue-700',
    promotional: 'bg-green-100 text-green-700',
    social: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-600',
  };

  const categoryColor = categoryColors[email.category] || categoryColors.other;

  function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <div
      onClick={onClick}
      className={`
        p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4
        ${email.read ? 'border-transparent' : 'border-blue-500 bg-blue-50/30'}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Sender Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {email.from?.[0]?.toUpperCase() || '?'}
        </div>

        {/* Email Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold text-gray-900 ${!email.read && 'font-bold'}`}>
              {email.from || 'Unknown Sender'}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${categoryColor}`}>
              {email.category}
            </span>
            {!email.read && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>

          <h3 className={`text-sm mb-1 ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {email.subject || '(No subject)'}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2">
            {email.summary || email.content?.substring(0, 150) || 'No content'}
          </p>

          {email.actionItems && email.actionItems.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs text-orange-600 font-medium">
                {email.actionItems.length} action item{email.actionItems.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Time */}
        <div className="text-xs text-gray-500 flex-shrink-0">
          {formatTime(email.receivedAt || Date.now())}
        </div>
      </div>
    </div>
  );
}

