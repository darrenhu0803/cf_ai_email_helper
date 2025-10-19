export default function EmailDetail({ email, onBack }) {
  const categoryColors = {
    important: 'bg-red-100 text-red-700',
    spam: 'bg-gray-100 text-gray-700',
    newsletter: 'bg-blue-100 text-blue-700',
    promotional: 'bg-green-100 text-green-700',
    social: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-600',
  };

  const categoryColor = categoryColors[email.category] || categoryColors.other;

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-900 flex-1">Email Details</h2>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Metadata */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                {email.from?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{email.from}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${categoryColor}`}>
                    {email.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600">To: {email.to}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(email.receivedAt)}</p>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{email.subject || '(No subject)'}</h1>
          </div>

          {/* AI Summary */}
          {email.summary && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="font-semibold text-blue-900">AI Summary</span>
              </div>
              <p className="text-gray-700">{email.summary}</p>
            </div>
          )}

          {/* Action Items */}
          {email.actionItems && email.actionItems.length > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-semibold text-orange-900">Action Items</span>
              </div>
              <ul className="space-y-2">
                {email.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span className="text-gray-700 flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Email Body */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {email.content}
            </div>
          </div>

          {/* Classification Info */}
          {email.classification && (
            <div className="mt-6 pt-6 border-t text-sm text-gray-500">
              <p>
                Classification: <span className="font-medium">{email.category}</span>
                {' • '}
                Confidence: <span className="font-medium">{(email.classification.confidence * 100).toFixed(0)}%</span>
              </p>
              {email.classification.reason && (
                <p className="mt-1">{email.classification.reason}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="border-t p-4 flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Reply
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Archive
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
}

